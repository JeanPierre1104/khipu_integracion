import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 === DIAGNÓSTICO KHIPU API v3 ===');
  
  const results: {
    timestamp: string;
    tests: Array<{
      name: string;
      status: string;
      details: Record<string, unknown>;
    }>;
  } = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Variables de entorno
  const apiKey = process.env.KHIPU_API_KEY;
  results.tests.push({
    name: 'Variables de entorno',
    status: apiKey ? 'OK' : 'FAIL',
    details: {
      apiKeyPresent: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'N/A'
    }
  });

  // Test 2: Conectividad básica
  try {
    console.log('🌐 Test 2: Conectividad básica...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://payment-api.khipu.com/v3/banks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        'Accept': 'application/json',
        'User-Agent': 'Khipu-Test-Client/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    
    results.tests.push({
      name: 'Conectividad API',
      status: response.ok ? 'OK' : 'FAIL',
      details: {
        httpStatus: response.status,
        httpStatusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseBody: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
        responseLength: responseText.length
      }
    });

  } catch (error) {
    results.tests.push({
      name: 'Conectividad API',
      status: 'ERROR',
      details: {
        error: error instanceof Error ? error.message : 'Error desconocido',
        errorType: error instanceof Error ? error.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    });
  }

  // Test 3: Conectividad DNS
  try {
    console.log('🌐 Test 3: DNS Resolution...');
    
    const dnsResponse = await fetch('https://1.1.1.1/dns-query?name=payment-api.khipu.com&type=A', {
      headers: { 'Accept': 'application/dns-json' },
      signal: AbortSignal.timeout(5000)
    });
    
    const dnsData = await dnsResponse.json();
    
    results.tests.push({
      name: 'DNS Resolution',
      status: 'OK',
      details: dnsData
    });

  } catch (error) {
    results.tests.push({
      name: 'DNS Resolution',
      status: 'ERROR',
      details: {
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    });
  }

  // Test 4: Ping básico
  try {
    console.log('🏓 Test 4: Ping básico...');
    
    const pingResponse = await fetch('https://khipu.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    results.tests.push({
      name: 'Ping khipu.com',
      status: 'OK',
      details: {
        httpStatus: pingResponse.status,
        responseTime: 'OK'
      }
    });

  } catch (error) {
    results.tests.push({
      name: 'Ping khipu.com',
      status: 'ERROR',
      details: {
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    });
  }

  const overallStatus = results.tests.every((test) => test.status === 'OK') ? 'ALL_OK' : 'ISSUES_FOUND';

  console.log('🏁 Diagnóstico completado:', overallStatus);

  return NextResponse.json({
    status: overallStatus,
    results
  });
}