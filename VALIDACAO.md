# Validação técnica — EnergyLab PRO 3.0 (atualização)

## Testes realizados

- `node tests/test_engine.js` — suíte existente: balanço, SOC, limites e 360 combinações energéticas.
- `node tests/test_project.js` — suíte nova: valor nominal/área FV, tensão a frio, MPPT, HSP, impacto térmico, corrente, viabilidade, progresso explícito e **400 combinações adicionais** de parâmetros.
- `python tests/test_v3_browser.py` — navegador: navegação, edição de dados, renovação e invalidação da verificação, diagrama SVG, questões de segurança, diagnóstico de falha, análise econômica e relatório.
- `python tests/test_v3_browser.py` — páginas da oficina em 320, 390, 768 e 1440 px, sem overflow horizontal do documento.
- `python tests/test_v3_final.py` — fluxo 7/7, exportação JSON e relatório HTML, invalidação de conclusões dependentes ao alterar entrada de projeto.

O navegador usado nos testes foi Chromium via Playwright em ambiente de execução controlado, carregando o HTML incorporado. O teste não representa homologação em todos os dispositivos ou versões dos navegadores.

## Critérios matemáticos

- Relação potência-energia com unidades explícitas.
- Strings em série somam tensão; paralelas somam corrente.
- Voc corrigida a frio e Vmp nas condições térmicas especificadas.
- MPPT por entrada e área disponível restringem associação elétrica.
- Alterações no dimensionamento invalidam evidências dependentes, inclusive análise econômica e relatório.
- Modo isolado não recebe retorno financeiro de tarifa conectada à rede.

## Conclusões e pendências técnicas

Os cálculos, a interface e o fluxo educacional básico foram validados por teste automatizado. A aplicação continua sendo uma **ferramenta didática com hipóteses simplificadas**. Uma versão para uso profissional precisaria integrar datasheets validados, irradiação geográfica com fonte confiável, normas oficiais atualizadas, cálculo executivo, segurança de dados e revisão de engenharia.
