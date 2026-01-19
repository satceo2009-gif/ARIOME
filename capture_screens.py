import asyncio
from playwright.async_api import async_playwright
import os

async def capture_all_screens():
    os.makedirs('/app/screenshots', exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1400, 'height': 900})
        page = await context.new_page()
        
        screens = [
            ('http://localhost:3000/', '01_welcome.png', 'Welcome Screen'),
            ('http://localhost:3000/onboarding', '02_onboarding.png', 'Onboarding Welcome'),
            ('http://localhost:3000/auth', '04_auth_login.png', 'Authentication - Login'),
            ('http://localhost:3000/reflect', '06_reflect.png', 'Reflect (Self-AriOme)'),
            ('http://localhost:3000/practices', '07_practices.png', 'Practices'),
            ('http://localhost:3000/wisdom', '08_wisdom.png', 'Wisdom Library'),
            ('http://localhost:3000/journal', '09_journal.png', 'Journal'),
            ('http://localhost:3000/circles', '10_circles.png', 'Circles (Community)'),
            ('http://localhost:3000/profile', '11_profile.png', 'Profile'),
        ]
        
        for url, filename, title in screens:
            try:
                await page.goto(url, wait_until='networkidle', timeout=15000)
                await page.wait_for_timeout(2000)
                await page.screenshot(path=f'/app/screenshots/{filename}')
                print(f'✓ Captured: {title}')
            except Exception as e:
                print(f'✗ Failed {title}: {e}')
        
        # Special: Onboarding intentions
        try:
            await page.goto('http://localhost:3000/onboarding', wait_until='networkidle')
            await page.wait_for_timeout(1500)
            await page.click('text=Begin Your Journey')
            await page.wait_for_timeout(2000)
            await page.screenshot(path='/app/screenshots/03_onboarding_intentions.png')
            print('✓ Captured: Onboarding Intentions')
        except Exception as e:
            print(f'✗ Failed Onboarding Intentions: {e}')
        
        # Special: Auth register
        try:
            await page.goto('http://localhost:3000/auth', wait_until='networkidle')
            await page.wait_for_timeout(1500)
            await page.click('text=Sign up')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/app/screenshots/05_auth_register.png')
            print('✓ Captured: Authentication - Register')
        except Exception as e:
            print(f'✗ Failed Auth Register: {e}')
        
        await browser.close()
        print('\nAll screenshots saved to /app/screenshots/')

asyncio.run(capture_all_screens())
