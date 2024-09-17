// rosquinha_com_fogo_ascii.js

let A = 0;
let B = 0;

const width = 110;  // Largura do terminal
const height = 60; // Altura do terminal

// Variáveis para o efeito de fogo
const fireWidth = width;
const fireHeight = Math.floor(height / 4); // Altura do fogo
const firePixels = new Array(fireWidth * fireHeight).fill(0);
const fireColors = [
  '\x1b[38;2;7;7;7m',     // Cor preta
  '\x1b[38;2;31;7;7m',    // Vermelho escuro
  '\x1b[38;2;47;15;7m',   // Vermelho
  '\x1b[38;2;71;15;7m',   // Laranja escuro
  '\x1b[38;2;87;23;7m',   // Laranja
  '\x1b[38;2;103;31;7m',  // Marrom
  '\x1b[38;2;119;31;7m',  // Marrom claro
  '\x1b[38;2;143;39;7m',  // Dourado
  '\x1b[38;2;159;47;7m',  // Dourado claro
  '\x1b[38;2;175;63;7m',  // Amarelo escuro
  '\x1b[38;2;191;71;7m',  // Amarelo
  '\x1b[38;2;199;71;7m',  // Amarelo claro
  '\x1b[38;2;223;79;7m',  // Amarelo brilhante
  '\x1b[38;2;223;87;7m',  // Amarelo intenso
  '\x1b[38;2;215;95;7m',  // Amarelo esbranquiçado
  '\x1b[38;2;255;255;255m' // Branco
];
const resetColor = '\x1b[0m';

function main() {
  process.stdout.write('\x1b[2J'); // Limpa a tela uma vez no início
  setInterval(() => {
    renderFrame();
    A += 0.07;
    B += 0.03;
  }, 50);
}

function renderFrame() {
  const buffer = [];
  const zBuffer = [];
  const bgAscii = ' ';
  const outputAscii = '.,-~:;=!*#$@';

  // Inicializa os buffers de saída e profundidade
  for (let k = 0; k < width * height; k++) {
    buffer[k] = bgAscii;
    zBuffer[k] = 0;
  }

  // Pré-cálculos para otimizar
  const sinA = Math.sin(A);
  const cosA = Math.cos(A);
  const sinB = Math.sin(B);
  const cosB = Math.cos(B);

  // Loop para gerar os pontos da rosquinha
  for (let j = 0; j < Math.PI * 2; j += 0.07) {
    const cosj = Math.cos(j);
    const sinj = Math.sin(j);
    const h = cosj + 2; // Raio menor do toróide
    for (let i = 0; i < Math.PI * 2; i += 0.02) {
      const cosi = Math.cos(i);
      const sini = Math.sin(i);

      const D = 1 / (sini * h * sinA + sinj * cosA + 5); // Profundidade inversa

      const t = sini * h * cosA - sinj * sinA; // Termo auxiliar para X e Y

      // Coordenadas de tela
      const x = Math.floor(width / 2 + (width * 0.3) * D * (cosi * h * cosB - t * sinB));
      const y = Math.floor(height / 2 + (height * 0.15) * D * (cosi * h * sinB + t * cosB));

      // Índice no buffer
      const idx = x + width * y;

      // Cálculo de luminância
      const L = Math.floor(
        8 *
          ((sinj * sinA - sini * cosj * cosA) * cosB -
            sini * cosj * sinA -
            sinj * cosA -
            cosi * cosj * sinB)
      );

      // Atualiza os buffers se o ponto está dentro da tela
      if (y >= 0 && y < height && x >= 0 && x < width && D > zBuffer[idx]) {
        zBuffer[idx] = D;
        buffer[idx] = outputAscii[Math.max(0, L)] || '.';
      }
    }
  }

  // Atualiza o efeito de fogo
  updateFire();

  // Renderiza o fogo no buffer principal
  renderFire(buffer);

  // Move o cursor para o topo sem limpar a tela
  process.stdout.write('\x1b[H');

  // Exibe o frame
  let output = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = x + width * y;
      let char = buffer[idx];

      // Aplica cor ao fogo
      if (y >= height - fireHeight) {
        const fireIdx = (y - (height - fireHeight)) * fireWidth + x;
        const colorIndex = Math.min(firePixels[fireIdx], fireColors.length - 1);
        char = fireColors[colorIndex] + char + resetColor;
      }

      output += char;
    }
    output += '\n';
  }
  process.stdout.write(output);
}

function updateFire() {
  // Inicializa a última linha do fogo com valores máximos
  for (let x = 0; x < fireWidth; x++) {
    firePixels[(fireHeight - 1) * fireWidth + x] = fireColors.length - 1;
  }

  // Propaga o fogo para cima
  for (let y = fireHeight - 2; y >= 0; y--) {
    for (let x = 0; x < fireWidth; x++) {
      const idx = y * fireWidth + x;
      const belowIdx = idx + fireWidth;

      const decay = Math.floor(Math.random() * 3);
      const intensity = firePixels[belowIdx] - decay;

      firePixels[idx] = intensity >= 0 ? intensity : 0;
    }
  }
}

function renderFire(buffer) {
  const fireStartY = height - fireHeight;
  for (let y = 0; y < fireHeight; y++) {
    for (let x = 0; x < fireWidth; x++) {
      const idx = x + width * (y + fireStartY);
      buffer[idx] = '█'; // Usa o bloco cheio para melhor visualização das cores
    }
  }
}

main();