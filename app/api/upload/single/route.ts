import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('🔄 [PROXY] Upload request received');
    console.log('🔄 [PROXY] Request URL:', request.url);
    console.log('🔄 [PROXY] Request method:', request.method);
    
    try {
        // Get the form data from the request
        const formData = await request.formData();
        console.log('🔄 [PROXY] FormData received, keys:', Array.from(formData.keys()));
        
        // Log file details
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`🔄 [PROXY] File field "${key}":`, {
                    name: value.name,
                    type: value.type,
                    size: value.size
                });
            }
        }
        
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            console.error('🔄 [PROXY] No authorization header');
            return NextResponse.json(
                { success: false, message: 'No authorization token provided' },
                { status: 401 }
            );
        }

        console.log('🔄 [PROXY] Auth header present:', authHeader.substring(0, 20) + '...');

        // Forward the request to the backend
        const backendUrl = 'http://localhost:5000/api/upload/single';
        
        console.log('🔄 [PROXY] Forwarding to backend:', backendUrl);
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
            },
            body: formData,
        });

        console.log('🔄 [PROXY] Backend response status:', response.status);
        console.log('🔄 [PROXY] Backend response statusText:', response.statusText);
        console.log('🔄 [PROXY] Backend response headers:', Object.fromEntries(response.headers.entries()));
        
        // Get response as text first
        const responseText = await response.text();
        console.log('🔄 [PROXY] Backend response text length:', responseText.length);
        console.log('🔄 [PROXY] Backend response text:', responseText.substring(0, 500));
        
        // Try to parse as JSON
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : { success: false, message: 'Empty response from backend' };
            console.log('🔄 [PROXY] Parsed data:', JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.error('🔄 [PROXY] Failed to parse JSON:', parseError);
            console.error('🔄 [PROXY] Raw response:', responseText);
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Backend returned invalid response',
                    details: responseText.substring(0, 200),
                    parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
                },
                { status: 500 }
            );
        }
        
        console.log('🔄 [PROXY] Returning response to client with status:', response.status);
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('🔄 [PROXY] Upload proxy error:', error);
        console.error('🔄 [PROXY] Error name:', error.name);
        console.error('🔄 [PROXY] Error message:', error.message);
        console.error('🔄 [PROXY] Error stack:', error.stack);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Error uploading image',
                error: error.message,
                errorName: error.name
            },
            { status: 500 }
        );
    }
}
