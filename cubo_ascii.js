// rosquinha_com_fogo_ascii.js

let A = 0;
let B = 0;

const width = 100;  // Largura do terminal
const height = 80; // Altura do terminal

// Variáveis para o efeito de fogo
const fireWidth = width;
const fireHeight = Math.floor(height / 4); // Altura do fogo
const firePixels = new Array(fireWidth * fireHeight).fill(0);
const fireChars = [' ', '.', ':', '!', '*', 'e', '&', '$', '@', '#'];

function main() {
  setInterval(() => {
    renderFrame();
    A += 0.07;
    B += 0.03;
  }, 50);
}

function renderFrame() {
  const b = [];
  const z = [];
  const bgAscii = ' ';
  const outputAscii = '.,-~:;=!*#$@';

  // Inicializa os buffers de saída e profundidade
  for (let k = 0; k < width * height; k++) {
    b[k] = bgAscii;
    z[k] = 0;
  }

  // Loop para gerar os pontos da rosquinha
  for (let j = 0; j < 6.28; j += 0.07) {
    for (let i = 0; i < 6.28; i += 0.02) {
      const sinA = Math.sin(A);
      const cosA = Math.cos(A);
      const sinB = Math.sin(B);
      const cosB = Math.cos(B);

      const cosj = Math.cos(j);
      const sinj = Math.sin(j);
      const cosi = Math.cos(i);
      const sini = Math.sin(i);

      const h = cosj + 2; // Raio menor do toróide
      const D = 1 / (sini * h * sinA + sinj * cosA + 5); // Profundidade inversa

      const t = sini * h * cosA - sinj * sinA; // Termo auxiliar para X e Y

      // Coordenadas de tela
      const x = Math.floor(width / 2 + (width * 0.3) * D * (cosi * h * cosB - t * sinB));
      const y = Math.floor(height / 2 + (height * 0.15) * D * (cosi * h * sinB + t * cosB));

      // Índice no buffer
      const o = x + width * y;

      // Cálculo de luminância
      const L = Math.floor(
        8 *
          ((sinj * sinA - sini * cosj * cosA) * cosB -
            sini * cosj * sinA -
            sinj * cosA -
            cosi * cosj * sinB)
      );

      // Atualiza os buffers se o ponto está dentro da tela
      if (y >= 0 && y < height && x >= 0 && x < width && D > z[o]) {
        z[o] = D;
        b[o] = outputAscii[Math.max(0, L)] || '.';
      }
    }
  }

  // Atualiza o efeito de fogo
  updateFire();

  // Renderiza o fogo no buffer principal
  renderFire(b);

  // Limpa a tela e exibe o frame
  console.clear();
  let output = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      output += b[x + width * y];
    }
    output += '\n';
  }
  console.log(output);
}

function updateFire() {
  // Inicializa a última linha do fogo com valores aleatórios
  for (let x = 0; x < fireWidth; x++) {
    firePixels[(fireHeight - 1) * fireWidth + x] = Math.floor(Math.random() * 36);
  }

  // Propaga o fogo para cima
  for (let y = 0; y < fireHeight - 1; y++) {
    for (let x = 0; x < fireWidth; x++) {
      const idx = y * fireWidth + x;
      const belowIdx = idx + fireWidth;
      const decay = Math.floor(Math.random() * 3);
      const intensity = firePixels[belowIdx] - decay;
      firePixels[idx] = intensity > 0 ? intensity : 0;
    }
  }
}

function renderFire(buffer) {
  const fireStartY = height - fireHeight;
  for (let y = 0; y < fireHeight; y++) {
    for (let x = 0; x < fireWidth; x++) {
      const idx = x + width * (y + fireStartY);
      const fireIdx = y * fireWidth + x;
      const intensity = firePixels[fireIdx];
      const charIdx = Math.min(Math.floor(intensity / 4), fireChars.length - 1);
      buffer[idx] = fireChars[charIdx];
    }
  }
}

main();