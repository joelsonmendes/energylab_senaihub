from pathlib import Path
import base64
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'css/styles.css').read_text(encoding='utf-8').replace("@import url('');",'')+'\n'+(root/'css/v3.css').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="css/styles.css" />','<style>\n'+css+'\n</style>')
html=html.replace('<link rel="stylesheet" href="css/v3.css" />','')
html=html.replace('<link rel="manifest" href="manifest.webmanifest" />','')
for name in ['engine','content','progress','scene3d','map','app','project_engine','v3']:
    tag=f'<script src="js/{name}.js" defer></script>'
    html=html.replace(tag,'<script>\n'+(root/f'js/{name}.js').read_text(encoding='utf-8')+'\n</script>')
image=(root/'assets/mapa-integracao-renovaveis.webp').read_bytes()
html=html.replace('assets/mapa-integracao-renovaveis.webp','data:image/webp;base64,'+base64.b64encode(image).decode('ascii'))
logo=(root/'assets/logo-senai-hub.webp').read_bytes()
html=html.replace('assets/logo-senai-hub.webp','data:image/webp;base64,'+base64.b64encode(logo).decode('ascii'))
output=root.parent/'EnergyLab_PRO_3_0_SENAI_HUB.html'
output.write_text(html,encoding='utf-8')
print(output,len(html),'bytes')
