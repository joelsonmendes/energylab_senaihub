from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
standalone=root.parent/(root.name+'.html')
html=standalone.read_text()
with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=browser.new_page(viewport={'width':1260,'height':860},accept_downloads=True)
  errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.on('dialog',lambda d:d.accept());p.set_content(html,wait_until='load')
  p.locator('[data-page="oficina"]').click()
  def tab(t):p.locator('[data-worktab="'+t+'"]').click()
  tab('vistoria');p.locator('[data-workaction="validate:site"]').click()
  tab('dimensionamento');p.locator('[data-workaction="validate:pv"]').click()
  tab('diagrama');p.locator('[data-workaction="mark-diagram"]').click()
  tab('seguranca')
  for id in p.locator('[data-safety]').evaluate_all('(els)=>els.map(e=>e.dataset.safety)'):
    p.locator(f'[data-safety="{id}"]').check()
  for id in p.locator('[data-doc]').evaluate_all('(els)=>els.map(e=>e.dataset.doc)'):
    p.locator(f'[data-doc="{id}"]').check()
  p.locator('[data-workaction="validate:safety"]').click()
  tab('comissionamento')
  for id in p.locator('[data-commission]').evaluate_all('(els)=>els.map(e=>e.dataset.commission)'):
    p.locator(f'[data-commission="{id}"]').check()
  p.locator('#v3-fault-answer').select_option('shadow')
  p.locator('[data-workaction="verify-fault"]').click()
  p.locator('[data-workaction="validate:commission"]').click()
  tab('economia');p.locator('[data-workaction="validate:economics"]').click()
  assert p.locator('#v3-completion').inner_text()=='6 / 7',p.locator('#v3-completion').inner_text()
  tab('relatorio')
  txt=p.locator('#work-meta-notes');txt.fill('A proposta é parcial, pois a área e a produtividade limitam a cobertura do consumo; o orçamento e os requisitos técnicos precisam ser confirmados em campo.');txt.press('Tab')
  p.locator('[data-workaction="validate:delivery"]').click()
  assert p.locator('#v3-completion').inner_text()=='7 / 7',p.locator('#v3-completion').inner_text()
  p.screenshot(path=str(root/'tests/preview_relatorio.png'),full_page=False)
  with p.expect_download() as info:p.locator('#v3-export').click()
  assert info.value.suggested_filename.endswith('.json')
  with p.expect_download() as info2:p.locator('[data-workaction="download-report"]').click()
  assert info2.value.suggested_filename.endswith('.html')
  tab('dimensionamento');p.locator('input[data-workfield="pv.series"]').fill('13');p.locator('input[data-workfield="pv.series"]').press('Tab')
  assert p.locator('#v3-completion').inner_text()=='3 / 7',p.locator('#v3-completion').inner_text()
  assert not errs,errs
  print('✓ Fluxo completo: 7/7 atividades, JSON e HTML exportáveis, alteração invalida as evidências pertinentes')
  browser.close()
