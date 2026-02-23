// Wallet Modal Debug Script
// Copy and paste this entire script into your browser's DevTools console while on http://localhost:3000

console.log('=== WALLET MODAL DEBUG SCRIPT ===\n');

// 1. Find the Connect Wallet button
console.log('1. Looking for Connect Wallet button...');
const buttons = Array.from(document.querySelectorAll('button'));
const connectButton = buttons.find(btn => btn.textContent.includes('Connect Wallet'));

if (connectButton) {
  console.log('✅ Found Connect Wallet button:', connectButton);
  console.log('   - Text:', connectButton.textContent);
  console.log('   - Computed styles:', {
    display: getComputedStyle(connectButton).display,
    visibility: getComputedStyle(connectButton).visibility,
    pointerEvents: getComputedStyle(connectButton).pointerEvents
  });
} else {
  console.log('❌ Connect Wallet button not found');
  console.log('   Available button texts:', buttons.map(b => b.textContent.trim()).filter(t => t));
}

// 2. Check for existing dialog elements
console.log('\n2. Checking for dialog elements...');
const dialogOverlay = document.querySelector('[data-slot="dialog-overlay"]');
const dialogContent = document.querySelector('[data-slot="dialog-content"]');
const radixDialog = document.querySelector('[role="dialog"]');
const radixPortal = document.querySelector('[data-radix-portal]');

console.log('   - Dialog overlay:', dialogOverlay ? '✅ Found' : '❌ Not found');
console.log('   - Dialog content:', dialogContent ? '✅ Found' : '❌ Not found');
console.log('   - Radix dialog:', radixDialog ? '✅ Found' : '❌ Not found');
console.log('   - Radix portal:', radixPortal ? '✅ Found' : '❌ Not found');

if (dialogOverlay) {
  console.log('   - Overlay z-index:', getComputedStyle(dialogOverlay).zIndex);
  console.log('   - Overlay display:', getComputedStyle(dialogOverlay).display);
  console.log('   - Overlay visibility:', getComputedStyle(dialogOverlay).visibility);
}

if (dialogContent) {
  console.log('   - Content z-index:', getComputedStyle(dialogContent).zIndex);
  console.log('   - Content display:', getComputedStyle(dialogContent).display);
  console.log('   - Content visibility:', getComputedStyle(dialogContent).visibility);
}

// 3. Check z-index issues
console.log('\n3. Checking z-index of body::before (noise overlay)...');
const bodyBefore = getComputedStyle(document.body, '::before');
console.log('   - body::before z-index:', bodyBefore.zIndex);
console.log('   - body::before position:', bodyBefore.position);

// 4. Function to click and monitor
console.log('\n4. Setting up click monitor...');
if (connectButton) {
  console.log('   Run: testWalletClick() to simulate click and monitor DOM changes');
  
  window.testWalletClick = function() {
    console.log('\n=== CLICKING CONNECT WALLET BUTTON ===');
    
    // Monitor DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            console.log('✨ New element added:', node.tagName, node.className || '', node);
            if (node.querySelector && node.querySelector('[role="dialog"]')) {
              console.log('   ⚠️  Dialog detected in added subtree!');
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Click the button
    connectButton.click();
    
    // Check after short delay
    setTimeout(() => {
      console.log('\n=== POST-CLICK CHECK (100ms) ===');
      const overlay = document.querySelector('[data-slot="dialog-overlay"]');
      const content = document.querySelector('[data-slot="dialog-content"]');
      const dialog = document.querySelector('[role="dialog"]');
      
      console.log('Dialog overlay:', overlay ? '✅ FOUND' : '❌ NOT FOUND');
      console.log('Dialog content:', content ? '✅ FOUND' : '❌ NOT FOUND');
      console.log('Role=dialog:', dialog ? '✅ FOUND' : '❌ NOT FOUND');
      
      if (overlay) {
        const overlayStyle = getComputedStyle(overlay);
        console.log('\n📊 Overlay styles:');
        console.log('   - z-index:', overlayStyle.zIndex);
        console.log('   - display:', overlayStyle.display);
        console.log('   - visibility:', overlayStyle.visibility);
        console.log('   - opacity:', overlayStyle.opacity);
        console.log('   - background:', overlayStyle.background);
        console.log('   - position:', overlayStyle.position);
        console.log('   - inset:', `${overlayStyle.top} ${overlayStyle.right} ${overlayStyle.bottom} ${overlayStyle.left}`);
      }
      
      if (content) {
        const contentStyle = getComputedStyle(content);
        console.log('\n📊 Content styles:');
        console.log('   - z-index:', contentStyle.zIndex);
        console.log('   - display:', contentStyle.display);
        console.log('   - visibility:', contentStyle.visibility);
        console.log('   - opacity:', contentStyle.opacity);
        console.log('   - position:', contentStyle.position);
        console.log('   - transform:', contentStyle.transform);
        
        // Check for title
        const title = content.querySelector('[data-slot="dialog-title"]');
        if (title) {
          console.log('   - Title text:', title.textContent);
          console.log('   - Title visible:', title.textContent.includes('Connect your wallet') ? '✅ YES' : '❌ NO');
        }
      }
      
      // Check all elements with high z-index
      console.log('\n📊 All elements with z-index > 50:');
      const allElements = document.querySelectorAll('*');
      const highZElements = Array.from(allElements).filter(el => {
        const z = parseInt(getComputedStyle(el).zIndex);
        return z > 50 && !isNaN(z);
      });
      highZElements.forEach(el => {
        console.log(`   - ${el.tagName}.${el.className}: z-index ${getComputedStyle(el).zIndex}`);
      });
      
      observer.disconnect();
      
      console.log('\n=== END OF POST-CLICK CHECK ===');
    }, 100);
    
    return 'Click initiated, monitoring DOM...';
  };
  
  console.log('\n✅ Ready! Run testWalletClick() to test the button.');
} else {
  console.log('❌ Cannot set up click test - button not found');
}

// 5. Check for console errors
console.log('\n5. Monitoring console for errors...');
const originalError = console.error;
console.error = function(...args) {
  console.log('🔴 CONSOLE ERROR DETECTED:', ...args);
  originalError.apply(console, args);
};

console.log('\n=== SCRIPT LOADED ===');
console.log('Commands available:');
console.log('  - testWalletClick() : Click button and monitor changes');
