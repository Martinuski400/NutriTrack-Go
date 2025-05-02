
'use client';
// This page is no longer needed as the tracker is on the home page.
// Redirect users to the home page.

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function FastingRedirectPage() {
    useEffect(() => {
        redirect('/home');
    }, []);

    // Optional: Show a loading or redirecting message
    return (
        <div className="container mx-auto max-w-md p-4 pb-20">
            <p className="text-center text-muted-foreground">Redirecting to Home page...</p>
        </div>
    );
}
