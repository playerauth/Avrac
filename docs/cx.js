// cx.js - Multiple CX IDs with auto fallback (single active CX)
(function() {
    // List of CX IDs – first is primary, others are backups
    const CX_LIST = [
    'c7967e2021dc3441d' ,
        '31487ed7aad2c49ac',
        '704b41ddf50d943fa'  
    // Backup CX
    ];
    
    let currentCxIndex = 0;
    let cseReady = false;          // becomes true when initializationCallback fires
    let fallbackTimer = null;      // timeout to detect non-working CX
    let scriptLoadAttempted = false;
    
    // Expose current CX to other scripts
    window.getCurrentCx = function() {
        return CX_LIST[currentCxIndex];
    };
    
    window.getAllCx = function() {
        return CX_LIST;
    };
    
    // Switch to next CX manually (used by fallback logic)
    window.switchToNextCx = function() {
        if (currentCxIndex < CX_LIST.length - 1) {
            currentCxIndex++;
            console.log(`🔄 Switched to backup CX: ${CX_LIST[currentCxIndex]}`);
            cseReady = false;
            scriptLoadAttempted = false;
            return true;
        }
        console.log('⚠️ No more backup CX available');
        return false;
    };
    
    // Clean up previous script and timer
    function cleanup() {
        if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }
        // Remove any old CSE scripts
        document.querySelectorAll('script[src*="cse.google.com/cse.js"]').forEach(script => script.remove());
    }
    
    // Called when the CSE script loads successfully
    window.cseScriptLoaded = function() {
        console.log(`📦 CSE script loaded for CX ${CX_LIST[currentCxIndex]}, waiting for initialization...`);
        // Start a timer – if initializationCallback doesn't fire within 5 seconds, consider CX invalid
        fallbackTimer = setTimeout(() => {
            if (!cseReady) {
                console.log(`⏱️ CX ${CX_LIST[currentCxIndex]} initialization timed out – assuming invalid/blocked`);
                // Try next CX
                if (window.switchToNextCx()) {
                    loadCseForCurrentCx();
                }
            }
        }, 5000);
    };
    
    // Called by Google when the CSE is fully initialized (CX is valid)
    window.__gcse = {
        parsetags: 'explicit',
        initializationCallback: function() {
            console.log(`✅ CSE successfully initialized with CX ${CX_LIST[currentCxIndex]}`);
            cseReady = true;
            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
                fallbackTimer = null;
            }
        }
    };
    
    // Load the CSE script for the current CX
    function loadCseForCurrentCx() {
        if (scriptLoadAttempted) return;
        scriptLoadAttempted = true;
        
        cleanup(); // remove any previous scripts/timers
        
        const script = document.createElement('script');
        // Use a fixed callback name; we define it globally above
        script.src = `https://cse.google.com/cse.js?cx=${CX_LIST[currentCxIndex]}&callback=cseScriptLoaded`;
        script.async = true;
        
        script.onerror = function() {
            console.log(`❌ Failed to load CSE script for CX ${CX_LIST[currentCxIndex]} (network/DNS error)`);
            // Immediately try next CX
            if (window.switchToNextCx()) {
                loadCseForCurrentCx();
            }
        };
        
        document.head.appendChild(script);
        console.log(`🚀 Attempting to load CSE with CX: ${CX_LIST[currentCxIndex]}`);
    }
    
    // Start the process with the first CX
    loadCseForCurrentCx();
    
    // Backup global error handler – catches any unexpected script errors
    window.addEventListener('error', function(e) {
        if (e.target.tagName === 'SCRIPT' && e.target.src.includes('cse.google.com') && !cseReady) {
            e.preventDefault();
            console.log('⚠️ Script error detected, triggering fallback');
            if (window.switchToNextCx()) {
                loadCseForCurrentCx();
            }
        }
    }, true);
    
})();