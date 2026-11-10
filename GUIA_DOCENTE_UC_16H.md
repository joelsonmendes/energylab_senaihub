# Guia docente — UC Integração de Sistemas de Energias Renováveis (16 horas)

## Fonte e delimitação

Material estruturado a partir do documento **UC_Integração de Sistemas de Energias Renováveis.pdf**, fornecido pelo usuário, com 6 páginas, identificando carga horária de 16 h, função F.3, objetivo geral, padrões de desempenho 1.1, 1.2 e 1.3, conhecimentos e capacidades socioemocionais. Os exercícios, tempos internos e rubrica abaixo são **propostas pedagógicas**, não transcrição literal do documento curricular.

## Situação de aprendizagem

**Título:** Estudo preliminar de integração fotovoltaica para uma indústria fictícia.

**Contextualização:** o aluno atua como técnico de uma empresa fictícia de engenharia que recebeu solicitação de uma indústria em Rio Branco. A instituição solicita um estudo preliminar para reduzir consumo elétrico de rede, considerando restrições de área, condições de instalação, equipamentos, segurança, documentação e economia.

**Desafio:** realizar vistoria simulada; levantar e conciliar quadro de cargas; propor conjunto FV e inversor dentro dos limites didáticos; interpretar diagrama e documentação; validar segurança e comissionamento simulado; avaliar resultado e elaborar o dossiê com justificativas e recomendações.

**Resultados esperados:** quadro de cargas, memória de cálculo, diagrama didático, checklist documental de segurança, resultados de ensaios simulados, viabilidade econômica simplificada e relatório com defesa técnica.

**Valores iniciais fictícios:** consumo mensal 1.800 kWh; área total 100 m²; área útil 75 m²; HSP 4,5 h/dia (apenas referência didática); tarifa R$ 0,92/kWh (ilustrativa); módulos e inversores simulados sem fabricante. **Não assumir que esses valores correspondem a dados reais da localidade.**

## Cronograma de 16 horas

| Etapa | Carga | 1º momento — abertura/contextualização | 2º momento — exposição dialogada / outra estratégia | 3º momento — prática em sala ou laboratório | Evidência |
|---|---:|---|---|---|---|
| 1. Fundamentos e integração | 2h | Análise das fontes na empresa | Sistemas on-grid/off-grid; grandezas; geração/armazenamento | Módulos Aprender e simulador de balanço | Diagnóstico pré/pós + comparação de cenários |
| 2. Levantamento técnico e concessionária | 3h | Ordem de serviço de cliente fictício | Leitura de fatura, demanda, classificação, levantamento do local | Oficina: vistoria e quadro de cargas | Registro de dados, pendências e hipóteses |
| 3. Dimensionamento e documentação | 4h | Solicitação de suprimento e restrição de área | Strings, Voc/Isc/Imp/Vmp, temperatura, perdas, MPPT e simbologia | Oficina: dimensionamento, erro intencional, diagrama SVG | Memória e diagrama |
| 4. Segurança, instalação e comissionamento | 3h | Ocorrência simulada de falha / não conformidade | Análise de riscos, materiais, verificação e documentação | Oficina: checklist e falha virtual, discussão da instalação | Critérios e diagnóstico registrados |
| 5. Situação de aprendizagem final | 4h | Equipe recebe pedido de entrega técnica | Discussão das soluções e viabilidade, avaliação das escolhas | Oficina: análise financeira, relatório e apresentação da equipe | Dossiê e rubrica aplicada pelo docente |
| **Total** | **16h** | | | | |

## Rubrica proposta (100%)

- Levantamento e interpretação dos dados — **15%**.
- Cálculos e dimensionamento — **25%**.
- Documentação e conformidade — **20%**.
- Segurança e comissionamento — **20%**.
- Justificativa, cooperação e proatividade — **20%**.

Pontuação manual pelo docente após analisar evidências, atitudes e defesa. O indicador **7/7** mostra apenas que os registros dos critérios educacionais foram completados, e **não é aprovação/certificação automática**.

## Estratégia de mediação

1. Antes de fornecer resposta, solicitar ao estudante previsão qualitativa e quantitativa.
2. Alterar uma variável por vez, distinguindo potência (W/kW) de energia (Wh/kWh).
3. Discutir divergências entre fatura e quadro de cargas: potência instalada não equivale a consumo.
4. Criar um erro intencional: aumentar os módulos em série até superar a tensão CC máxima; pedir que o aluno explique a correção e o risco técnico.
5. Criar outro erro: exceder área útil ou corrente de entrada de MPPT; discutir limites múltiplos, não somente potência.
6. Comparar cenários com e sem irradiância, com falha do inversor e com rede isolada usando o simulador legado.
7. Exigir que todo relatório traga premissas, limitações, dependências e referências a verificar.
8. Avaliar cooperação e proatividade por observação e rubrica, não inferir tais atributos do clique em um checkbox.

## Relação com a ementa

- **1.1:** identificação de local/infraestrutura/equipamentos, critérios da concessionária e levantamento de dados — foco na vistoria, fatura e checklist documental.
- **1.2:** requisitos de segurança, procedimentos, resíduos, simbologias, comissionamento e parametrização — foco no diagrama, checklist e ensaios simulados.
- **1.3:** viabilidade técnica e econômica, seleção de soluções e matemática financeira — foco no dimensionamento, alternativas e retorno simples.

## Limitações pedagógicas

O simulador não comprova homologação nem atende integralmente à prática presencial de instalação. Os 16 h são destinados à integração e contextualização; execução física, comissionamento de equipamentos reais, segurança e normas devem ser tratados sob supervisão competente e em ambientes apropriados. Os materiais oficiais devem ser consultados em suas versões vigentes.
