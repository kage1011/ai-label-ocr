import fs from "fs";
import path from "path";

const archifyPath = path.resolve(__dirname, "archify.json");
const outputDir = path.resolve(process.cwd(), "docs");
const outputPath = path.resolve(outputDir, "architecture-diagram.html");

if (!fs.existsSync(archifyPath)) {
  console.error("archify.json not found!");
  process.exit(1);
}

const rawData = fs.readFileSync(archifyPath, "utf-8");
const archData = JSON.parse(rawData);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${archData.system.name} - Architecture Diagram (Archify)</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --accent: #818cf8;
      --success: #34d399;
      --warning: #fbbf24;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 2rem;
      min-height: 100vh;
    }
    header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    h1 {
      font-size: 2.2rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .badge-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1rem;
    }
    .badge {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
    }
    .architecture-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .layer-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s, border-color 0.2s;
    }
    .layer-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }
    .layer-title {
      font-size: 1.25rem;
      color: var(--accent);
      border-bottom: 2px solid var(--card-border);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    .component-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .component-item {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.75rem;
      border-radius: 8px;
      border-left: 3px solid var(--primary);
    }
    .comp-name {
      font-weight: 600;
      color: var(--text);
      font-size: 0.95rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .comp-type {
      font-size: 0.75rem;
      background: #334155;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: #cbd5e1;
    }
    .comp-role {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .data-flow-section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 2rem;
    }
    .data-flow-title {
      font-size: 1.5rem;
      color: var(--success);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .timeline {
      position: relative;
      border-left: 2px solid #334155;
      margin-left: 1rem;
      padding-left: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .timeline-item {
      position: relative;
    }
    .timeline-item::before {
      content: "";
      position: absolute;
      left: -1.95rem;
      top: 0.35rem;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 8px var(--primary);
    }
    .step-number {
      font-size: 0.8rem;
      font-weight: bold;
      color: var(--warning);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .step-route {
      font-weight: 600;
      color: var(--text);
      font-size: 1rem;
    }
    .step-action {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.2rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>${archData.system.name}</h1>
    <p class="subtitle">${archData.system.description}</p>
    <div class="badge-container">
      ${Object.entries(archData.system.technologyStack)
        .map(([k, v]) => `<span class="badge"><strong>${k}:</strong> ${v}</span>`)
        .join("")}
    </div>
  </header>

  <h2 style="margin-bottom: 1rem; color: #e2e8f0;">Architectural Layers & Repositories</h2>
  <div class="architecture-grid">
    ${archData.architecture.layers
      .map(
        (layer: any) => `
      <div class="layer-card">
        <h3 class="layer-title">${layer.name}</h3>
        <ul class="component-list">
          ${layer.components
            .map(
              (c: any) => `
            <li class="component-item">
              <div class="comp-name">
                <span>${c.name}</span>
                <span class="comp-type">${c.type}</span>
              </div>
              ${c.role ? `<div class="comp-role">${c.role}</div>` : ""}
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `
      )
      .join("")}
  </div>

  <div class="data-flow-section">
    <h2 class="data-flow-title">End-to-End Scan & Database Flow</h2>
    <div class="timeline">
      ${archData.architecture.dataFlow
        .map(
          (step: any) => `
        <div class="timeline-item">
          <div class="step-number">Step ${step.step}</div>
          <div class="step-route">${step.from} &rarr; ${step.to}</div>
          <div class="step-action">${step.action}</div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(outputPath, html, "utf-8");
console.log(`[Archify] Interactive architecture diagram generated at: ${outputPath}`);

