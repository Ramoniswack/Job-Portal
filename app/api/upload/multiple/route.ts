import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Get the form data from the request
        const formData = await request.formData();
        
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: 'No authorization token provided' },
                { status: 401 }
            );
        }

        // Forward the request to the backend
        const backendUrl = 'http://localhost:5000/api/upload/multiple';
        
        console.log('Proxying upload to:', backendUrl);
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
            },
            body: formData,
        });

        console.log('Backend response status:', response.status);
        
        // Try to parse as JSON
        let data;
        try {
            data = await response.json();
            console.log('Backend response data:', data);
        } catch (parseError) {
            const text = await response.text();
            console.error('Failed to parse JSON. Response text:', text);
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Backend returned invalid response',
                    details: text.substring(0, 200)
                },
                { status: 500 }
            );
        }
        
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Upload proxy error:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Error uploading images',
                error: error.message,
                details: 'Check if backend server is running on port 5000'
            },
            { status: 500 }
        );
    }
}
