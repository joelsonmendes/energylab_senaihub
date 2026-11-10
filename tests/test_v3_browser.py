from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
standalone=root.parent/(root.name+'.html')
html=standalone.read_text()
def page_for(browser,w=1440,h=900):
    p=browser.new_page(viewport={'width':w,'height':h}, device_scale_factor=1)
    p.on('dialog', lambda d: d.accept())
    errs=[];p.on('pageerror',lambda e: errs.append(str(e)))
    p.set_content(html,wait_until='load',timeout=30000)
    assert not errs,errs
    return p,errs
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page,errs=page_for(b)
    page.locator('[data-page="oficina"]').click()
    assert page.locator('#page-oficina.active').count()==1
    assert page.locator('#v3-completion').inner_text()=='0 / 7'
    page.locator('[data-worktab="vistoria"]').click()
    assert 'Levantamento técnico' in page.locator('#workbench-content').inner_text()
    assert page.locator('tbody tr').count()>=3
    page.locator('[data-workaction="validate:site"]').click()
    assert page.locator('#v3-completion').inner_text()=='1 / 7'
    field=page.locator('input[data-workfield="site.consumption"]')
    field.fill('2300');field.press('Tab')
    assert page.evaluate('window.EnergyLabProjectTest.getProject().site.consumption')==2300
    assert page.locator('#v3-completion').inner_text()=='0 / 7'
    page.locator('[data-worktab="dimensionamento"]').click()
    assert page.locator('input[data-workfield="pv.series"]').count()==1
    assert 'Voc corrigida a frio' in page.locator('#workbench-content').inner_text()
    page.locator('input[data-workfield="pv.series"]').fill('13');page.locator('input[data-workfield="pv.series"]').press('Tab')
    assert 'excede o limite CC' in page.locator('#workbench-content').inner_text()
    page.locator('input[data-workfield="pv.series"]').fill('10');page.locator('input[data-workfield="pv.series"]').press('Tab')
    page.locator('[data-workaction="validate:pv"]').click()
    assert page.locator('#v3-completion').inner_text()=='1 / 7'
    page.locator('[data-worktab="diagrama"]').click()
    assert page.locator('#v3-singleline').count()==1
    page.locator('[data-workaction="mark-diagram"]').click()
    assert page.locator('#v3-completion').inner_text()=='2 / 7'
    page.locator('[data-worktab="seguranca"]').click()
    assert page.locator('[data-safety]').count()==9
    page.locator('[data-safety]').first.check()
    assert page.evaluate('window.EnergyLabProjectTest.getProject().safety.site') is True
    page.locator('[data-worktab="comissionamento"]').click()
    assert page.locator('[data-commission]').count()==5
    page.locator('#v3-fault-answer').select_option('shadow')
    page.locator('[data-workaction="verify-fault"]').click()
    assert page.evaluate('window.EnergyLabProjectTest.getProject().commission.passed') is True
    page.locator('[data-worktab="economia"]').click()
    assert 'Retorno simples' in page.locator('#workbench-content').inner_text()
    page.locator('[data-worktab="relatorio"]').click()
    assert page.locator('#v3-report').count()==1
    assert '2. Proposta de geração' in page.locator('#v3-report').inner_text()
    assert not errs,errs
    page.locator('[data-worktab="trilha"]').click()
    page.screenshot(path=str(root/'tests/preview_desktop.png'),full_page=True)
    print('✓ Navegação, validação, invalidação de evidências, MPPT, diagrama, segurança, comissionamento e relatório')
    for w in (320,390,768,1440):
        page.set_viewport_size({'width':w,'height':820})
        for tab in ('trilha','vistoria','dimensionamento','diagrama','seguranca','comissionamento','economia','relatorio'):
            page.locator(f'[data-worktab="{tab}"]').click()
            document=page.evaluate('({sw:document.documentElement.scrollWidth,iw:window.innerWidth})')
            assert document['sw']<=document['iw']+2,(w,tab,document)
        page.locator('[data-worktab="trilha"]').click()
        if w==390:page.screenshot(path=str(root/'tests/preview_mobile.png'),full_page=True)
    print('✓ Sem overflow horizontal em larguras de 320, 390, 768 e 1440 pixels, nas oito etapas')
    assert not errs,errs
    page.close();b.close()
