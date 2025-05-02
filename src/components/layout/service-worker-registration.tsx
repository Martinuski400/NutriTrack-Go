'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const ServiceWorkerRegistration = () => {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
            // Optional: Check for updates
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker) {
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New content is available and waiting to be installed.
                                // Can prompt user to reload.
                                console.log('New content is available; please refresh.');
                                // Example toast:
                                // toast({
                                //     title: "Update Available",
                                //     description: "A new version of the app is ready. Reload to update.",
                                //     action: <button onClick={() => window.location.reload()}>Reload</button>,
                                //     duration: Infinity // Keep toast until action or dismissal
                                // });
                            } else {
                                // Content is cached for offline use.
                                console.log('Content is cached for offline use.');
                            }
                        }
                    };
                }
            };
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
            toast({
                title: "Offline Mode Error",
                description: "Could not initialize features needed for offline use or notifications.",
                variant: "destructive",
            })
          });
      });
    } else {
       console.warn('Service Workers not supported in this browser.');
       // Optionally inform the user that offline features/notifications won't work
        // toast({
        //     title: "Browser Not Supported",
        //     description: "Offline features and notifications require a more modern browser.",
        //     variant: "destructive",
        // })
    }
  }, [toast]); // Add toast to dependency array

  // This component doesn't render anything visible
  return null;
};

export default ServiceWorkerRegistration;
