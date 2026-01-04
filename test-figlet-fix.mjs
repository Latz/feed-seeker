import figlet from 'figlet';
import gradient from 'gradient-string';
import fs from 'fs';

// Try to load the font manually
const fontData = fs.readFileSync('./modules/Graffiti.flf', 'utf8');
figlet.parseFont('Graffiti', fontData);

console.log('Font loaded, testing...');

try {
  const result = figlet.textSync('FeedSeeker', {
    font: 'Graffiti',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  console.log('Success!');
  console.log(gradient.rainbow(result));
} catch (err) {
  console.log('Error:', err.message);
}