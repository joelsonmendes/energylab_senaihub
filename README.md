# EnergyLab PRO 3.0 — Integração de Sistemas de Energias Renováveis

**Aplicativo educacional SENAI HUB · UC Integração de Sistemas de Energias Renováveis · 16 horas**

A V3 preserva todo o EnergyLab PRO 2.1 (fundamentos, solar, eólica, baterias, microrredes, esquema SVG 2D, ambiente espacial 3D em Canvas 2D, Mapa Vivo WebP animado, cenários, comparador A/B, quiz e progresso) e acrescenta a **Oficina PRO**, uma jornada profissional alinhada à ementa fornecida pelo usuário.

## Como abrir

- **Arquivo único:** abrir `EnergyLab_PRO_3_0_SENAI_HUB.html` (entregue fora desta pasta). Contém HTML, CSS, JS, logo SENAI HUB e Mapa Vivo como imagens incorporadas. Não requer internet, servidor nem API.
- **Código modular:** na pasta do ZIP executar `iniciar_windows.bat` em Windows com Python instalado; em Linux/macOS executar `python3 -m http.server 8080` e acessar `http://localhost:8080`.
- **Publicação:** hospedar os arquivos do diretório da aplicação na raiz de um site estático (Vercel, GitHub Pages, Netlify). A instalação PWA requer HTTPS ou localhost; arquivo aberto com `file://` não instala service worker.

## Menu / Oficina PRO

| Área | Objetivo e operações | Evidências |
|---|---|---|
| Visão geral | trilha SENAI de 16 h, padrões 1.1/1.2/1.3, comparação conceitual de fontes | acompanhamento 0–7 |
| 1. Levantamento | dados do cliente fictício, consumo, HSP manual, área útil, cargas editáveis, classificação e dados tarifários | quadro de cargas e vistoria |
| 2. Dimensionamento | valores ilustrativos ou datasheets informados: Wp, Voc, Vmp, Isc, Imp, coeficientes térmicos, série/paralelo, MPPT, área, PR e sombra | alertas verificáveis, memória de cálculo e integração com simulador |
| 3. Diagrama | SVG unifilar **funcional e didático**, arquitetura conectada/isolada, blocos de potência | exportação SVG e registro de interpretação |
| 4. Segurança | checklist de análise de riscos, conformidade, resíduos, EPI/EPC e documentos a conferir na concessionária | checklist de 9 critérios e 6 itens documentais |
| 5. Comissionamento | instrumentos simulados, verificações, interpretação de quatro tipos de falha | diagnóstico e cinco verificações documentais |
| 6. Viabilidade | custos de módulos, inversor, instalação, engenharia, O&M, produção valorizada, tarifa e payback simples | estimativa e hipóteses expostas |
| 7. Relatório | dossiê e defesa técnica, rubrica docente e verificação de evidências | imprimir/salvar PDF via navegador, exportar HTML e projeto JSON |

## Arquitetura

- `index.html` — navegação, páginas e elementos DOM, inclusive a Oficina PRO.
- `css/styles.css` — sistema visual e tela do EnergyLab original.
- `css/v3.css` — componentes e responsividade da Oficina PRO.
- `js/engine.js` — modelo de microrrede com despacho, SOC, perdas e limites.
- `js/content.js` — seis módulos e desafios da versão original.
- `js/progress.js` — progresso da aprendizagem original.
- `js/scene3d.js` — projeção 3D em Canvas 2D e controles de câmera.
- `js/map.js` — Mapa Vivo, ligações SVG e indicações energéticas.
- `js/app.js` — interface principal e integração com Oficina PRO.
- `js/project_engine.js` — fórmulas didáticas independentes e validações do projeto profissional.
- `js/v3.js` — telas, formulários, persistência de dados, exportação e avaliação.
- `sw.js` e `manifest.webmanifest` — arquivos para uso PWA/offline ao hospedar em HTTPS/localhost.
- `assets/` — Mapa Vivo WebP, logomarca original SENAI HUB e ícones.
- `tests/` — testes unitários e de fluxo de interface.

## Exemplos de fórmulas aplicadas

1. **Consumo elétrico das cargas:** `E = Σ(quantidade × potência [W] × horas/dia × dias/mês) / 1000` em kWh/mês. Potência conectada não é demanda contratada nem medida.
2. **Potência nominal CC:** `Pcc [Wp] = Nsérie × Nparalelo × Pmódulo [Wp]`.
3. **Voc no frio:** `Voc_string = Nsérie × Voc_STC × [1 + (βVoc [%/°C] / 100) × (Tmin [°C] − 25 °C)]`.
4. **Vmp quente e frio:** modelo linear equivalente com `βVmp`; verificar janela MPPT nas condições adotadas.
5. **Imax de MPP por MPPT:** `Imp_módulo × ceil(strings/quantidade de MPPTs)`. Supõe distribuição equilibrada, não substitui análise real de múltiplas entradas.
6. **Energia estimada:** `E_mês [kWh] = (Pcc [Wp]/1000) × HSP [h/dia] × PR × (1 − sombra/100) × 30`.
7. **Payback simples:** `Investimento / (economia anual − O&M anual)`, quando o denominador for positivo. Não é VPL nem garantia de retorno.

## Hipóteses e salvaguardas

- Dados de cliente, irradiância de referência, HSP, tarifa, equipamentos e custos são ilustrativos. Os módulos pré-definidos são **fictícios**, não datasheets de fabricantes.
- Valores de HSP dependem de irradiação solar e localidade; a aplicação não realiza consulta automática a uma fonte solarimétrica. Para estudo real, usar base validada.
- O modelo não realiza dimensionamento executivo de cabos, proteções, aterramento, seccionamento, parametrização real do inversor, conexão ou análise de qualidade de energia.
- A associação de strings e verificação dos limites simplificadas não substituem validação de catálogos, curvas de equipamento, ensaios, normas técnicas e exigências da concessionária.
- O estudo econômico da Oficina PRO está configurado para **on-grid**. Para off-grid, é necessário modelo de autonomia e comparação de geração substituída, não compensação de fatura. A simulação geral continua incluindo sistemas isolados.
- O editor de diagrama apresenta topologia funcional para ensino, **não esquema de proteção ou desenho homologável**.
- Os ensaios do comissionamento são apenas leituras simuladas, sem instruções de intervenção ou testes reais energizados.
- A lista de documentos é orientativa, não obrigatória para todos os tipos de atendimento. Consultar a concessionária, fontes oficiais e normas vigentes antes de usar em projetos reais.
- O PDF da Oficina PRO é gerado pela função de impressão do navegador, selecionando **Salvar como PDF**; não há biblioteca de PDF externa.
- O processo pedagógico registra 7 critérios e impede que alterações relevantes mantenham evidências antigas validadas.
- Dados gravados somente no `localStorage` do próprio navegador, sem autenticação, criptografia de dados em repouso, sincronização ou upload. **Evitar dados reais de clientes, CPF ou documentos sensíveis**, especialmente em equipamentos compartilhados.

## Testes

```bash
node tests/test_engine.js
node tests/test_project.js
python tests/build_standalone.py
python tests/test_v3_browser.py
python tests/test_v3_final.py
```

Os testes de interface usam Chromium e Playwright. Em ambientes sem Chromium na configuração padrão, indicar `/usr/bin/chromium` como executável. O teste de interface utiliza HTML incorporado para não depender de endereço de rede.

Para documentação pedagógica adicional consulte `GUIA_DOCENTE_UC_16H.md`, `MATRIZ_RASTREABILIDADE_UC.md` e `VALIDACAO.md`.
