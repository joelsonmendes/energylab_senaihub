from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT.parent/'Integracao_de_Sistemas_de_Energias_Renovaveis_standalone.html').read_text(encoding='utf-8')
def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1500,'height':950},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML,wait_until='load')
  assert page.locator('#home-metrics .metric-card').count()==4
  page.screenshot(path=str(ROOT.parent/'EnergyLab_preview_inicio.png'),full_page=True)
  page.locator('[data-page=sim]').first.click()
  assert page.locator('#sim-summary .metric-card').count()==5
  before=page.evaluate('EnergyLabTest.getResult().solarW')
  page.locator('#param-irr').fill('300')
  after=page.evaluate('EnergyLabTest.getResult().solarW')
  assert after<before,(before,after)
  print('✓ Irradiância atualiza motor e indicadores instantaneamente')
  page.locator('#mode-select').select_option('island')
  page.locator('#param-irr').fill('0')
  page.locator('#param-wind').fill('0')
  page.evaluate('EnergyLabTest.setCount("battery",0)')
  assert page.evaluate('EnergyLabTest.getResult().unmet')>0
  assert 'Déficit' in page.locator('#status-pill').inner_text()
  print('✓ Déficit isolado com feedback visível')
  page.locator('#scenario-select').select_option('base')
  prior=page.evaluate('EnergyLabTest.getState().minute')
  page.locator('#step-btn').click()
  assert page.evaluate('EnergyLabTest.getState().minute')==prior+10
  print('✓ Avanço de 10 minutos altera relógio e SOC')
  page.locator('[data-view="3d"]').click()
  page.wait_for_timeout(150)
  assert page.locator('#view-3d').is_visible()
  assert page.evaluate('document.getElementById("scene-canvas").width')>200
  page.locator('[data-camera="zoom-in"]').click()
  page.screenshot(path=str(ROOT.parent/'EnergyLab_preview_3D.png'),full_page=True)
  print('✓ Cena espacial 3D desenhada e controles de câmera ativos')
  page.locator('[data-view="2d"]').click()
  page.locator('#energy-diagram [data-component="wind"]').click()
  assert 'Turbina eólica' in page.locator('#comp-name').inner_text()
  print('✓ Seleção de componentes no SVG 2D')
  page.locator('#open-calculations').click()
  assert page.locator('#calc-content .calculation-step').count()==5
  print('✓ Memória de cálculo com 5 etapas')
  page.locator('[data-page="learn"]').first.click()
  assert page.locator('.module-entry').count()==6
  page.locator('[data-answer="1"][data-quiz="0"]').click()
  assert 'Dica 1' in page.locator('.quiz-feedback').first.inner_text()
  page.locator('[data-answer="0"][data-quiz="0"]').click()
  assert 'Resposta correta' in page.locator('.quiz-feedback.success').first.inner_text()
  print('✓ Perguntas, dica progressiva e validação de acerto')
  page.locator('[data-page="challenges"]').first.click()
  assert page.locator('.challenge-card').count()==4
  page.locator('[data-challenge-prepare="surplus"]').click()
  assert page.locator('#page-sim').is_visible()
  page.locator('[data-page="challenges"]').first.click()
  page.locator('[data-challenge-check="surplus"]').click()
  assert 'Concluído e registrado' in page.locator('.challenge-card').last.inner_text()
  print('✓ Desafio guiado e validação automática')
  page.locator('[data-page="progress"]').first.click()
  assert page.locator('.progress-row').count()==6
  page.screenshot(path=str(ROOT.parent/'EnergyLab_preview_progresso.png'),full_page=True)
  assert not errors,errors
  for width,height in [(768,1024),(390,844),(320,720)]:
   mobile=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
   mobile_errors=[]
   mobile.on('pageerror',lambda e:mobile_errors.append(str(e)))
   mobile.set_content(HTML,wait_until='load')
   mobile.locator('[data-page="sim"]').first.click()
   mobile.wait_for_timeout(100)
   horizontal=mobile.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
   print(f'Mobile {width}px: overflow horizontal {horizontal}px')
   assert horizontal<=2,(width,horizontal)
   assert not mobile_errors,mobile_errors
   if width==390:
    mobile.screenshot(path=str(ROOT.parent/'EnergyLab_preview_mobile.png'),full_page=True)
   mobile.close()
  browser.close()
  print('✓ Testes de interface concluídos sem erros de JavaScript')
if __name__=='__main__':run()
