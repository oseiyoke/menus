const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Maskable icon sizes (with padding for safe area)
const maskableIconSizes = [
  { size: 192, name: 'maskable-icon-192x192.png' },
  { size: 512, name: 'maskable-icon-512x512.png' }
];

async function generateIcons() {
  const inputFile = path.join(__dirname, '../public/favicon.svg');
  const outputDir = path.join(__dirname, '../public/icons');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error('❌ favicon.svg not found at public/favicon.svg');
    process.exit(1);
  }

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎨 Generating PWA icons from favicon.svg...\n');

  try {
    // Generate regular icons
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate maskable icons (with padding for safe area)
    for (const { size, name } of maskableIconSizes) {
      const outputPath = path.join(outputDir, name);
      const paddedSize = Math.round(size * 0.8); // 80% of total size for safe area
      
      // Create a canvas with background color
      const canvas = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 34, g: 197, b: 94, alpha: 1 } // #22C55E - theme color
        }
      });

      // Composite the resized SVG onto the canvas
      await canvas
        .composite([{
          input: await sharp(inputFile)
            .resize(paddedSize, paddedSize, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer(),
          gravity: 'center'
        }])
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size}, maskable)`);
    }

    // Generate apple-touch-icon (180x180)
    const appleIconPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(inputFile)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(appleIconPath);
    
    console.log('✅ Generated apple-touch-icon.png (180x180)');

    // Generate favicon.png (32x32)
    const faviconPath = path.join(__dirname, '../public/favicon.png');
    await sharp(inputFile)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);
    
    console.log('✅ Generated favicon.png (32x32)');

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\n📱 Your app icons are ready for:');
    console.log('   • iOS Home Screen');
    console.log('   • Android Home Screen');
    console.log('   • Desktop App Installation');
    console.log('   • PWA Manifest');
    
    // Validate generated files
    const missingFiles = [];
    for (const { name } of [...iconSizes, ...maskableIconSizes]) {
      if (!fs.existsSync(path.join(outputDir, name))) {
        missingFiles.push(name);
      }
    }

    if (missingFiles.length > 0) {
      console.log('\n⚠️  Warning: Some icons were not generated:');
      missingFiles.forEach(file => console.log(`   • ${file}`));
    }

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run the script
generateIcons().catch(console.error); 