import { useEffect } from 'react';

/**
 * Hook para monitorear el rendimiento de la aplicación
 * Solo se ejecuta en modo desarrollo
 */
export const usePerformanceMonitor = () => {
    useEffect(() => {
        if (import.meta.env.DEV) {
            // Observar métricas de rendimiento
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    // console.log(`📊 [Performance] ${entry.name}:`, {
                    //     duration: `${entry.duration.toFixed(2)}ms`,
                    //     startTime: `${entry.startTime.toFixed(2)}ms`,
                    // });
                }
            });

            observer.observe({ entryTypes: ['measure', 'navigation'] });

            // Métricas de navegación
            if (performance.getEntriesByType) {
                const navigationEntries = performance.getEntriesByType('navigation');
                if (navigationEntries.length > 0) {
                    const nav = navigationEntries[0];
                    // console.log('🚀 [Navigation Timing]:', {
                    //     'DNS Lookup': `${(nav.domainLookupEnd - nav.domainLookupStart).toFixed(2)}ms`,
                    //     'TCP Connection': `${(nav.connectEnd - nav.connectStart).toFixed(2)}ms`,
                    //     'Request Time': `${(nav.responseStart - nav.requestStart).toFixed(2)}ms`,
                    //     'Response Time': `${(nav.responseEnd - nav.responseStart).toFixed(2)}ms`,
                    //     'DOM Processing': `${(nav.domComplete - nav.domLoading).toFixed(2)}ms`,
                    //     'Total Load Time': `${(nav.loadEventEnd - nav.fetchStart).toFixed(2)}ms`,
                    // });
                }
            }

            // Métricas de recursos
            const resources = performance.getEntriesByType('resource');
            const resourceStats = {
                total: resources.length,
                scripts: resources.filter(r => r.initiatorType === 'script').length,
                css: resources.filter(r => r.initiatorType === 'css').length,
                images: resources.filter(r => r.initiatorType === 'img').length,
                totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            };

            // console.log('📦 [Resources Loaded]:', {
            //     ...resourceStats,
            //     totalSize: `${(resourceStats.totalSize / 1024).toFixed(2)} KB`,
            // });

            return () => observer.disconnect();
        }
    }, []);
};

/**
 * Componente para mostrar métricas de rendimiento en desarrollo
 */
export const PerformanceMonitor = () => {
    usePerformanceMonitor();
    return null;
};

/**
 * Utilidad para medir el tiempo de ejecución de una función
 */
export const measurePerformance = (name, fn) => {
    if (import.meta.env.DEV) {
        performance.mark(`${name}-start`);
        const result = fn();
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        return result;
    }
    return fn();
};

/**
 * Hook para medir el tiempo de renderizado de un componente
 */
export const useRenderTime = (componentName) => {
    useEffect(() => {
        if (import.meta.env.DEV) {
            const startTime = performance.now();
            return () => {
                const endTime = performance.now();
                console.log(`⏱️ [Render Time] ${componentName}: ${(endTime - startTime).toFixed(2)}ms`);
            };
        }
    });
};
