import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: 'No authorization token provided' },
                { status: 401 }
            );
        }

        // Get publicId from query parameter
        const { searchParams } = new URL(request.url);
        const publicId = searchParams.get('publicId');
        
        if (!publicId) {
            return NextResponse.json(
                { success: false, message: 'No publicId provided' },
                { status: 400 }
            );
        }

        console.log('Deleting image with publicId:', publicId);

        // Forward the request to the backend
        // The backend expects the publicId in the URL path
        const backendUrl = `http://localhost:5000/api/upload/${encodeURIComponent(publicId)}`;
        
        console.log('Backend URL:', backendUrl);
        
        const response = await fetch(backendUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
            },
        });

        console.log('Backend response status:', response.status);

        // Check if response is ok before parsing
        if (!response.ok) {
            const text = await response.text();
            console.error('Backend error response:', text);
            return NextResponse.json(
                { success: false, message: 'Backend delete failed', details: text },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Backend response data:', data);
        
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Delete proxy error:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Error deleting image',
                error: error.message 
            },
            { status: 500 }
        );
    }
}
