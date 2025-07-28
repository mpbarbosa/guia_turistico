import os
import requests

# Inicialmente faz-se necessário criar uma pasta que receberá os dados do IBGE
data_path = os.path.join("..", "ibge_data")
input_path = os.path.join(data_path, "input")
output_path = os.path.join(data_path, "output")

output_path_geo = os.path.join(output_path, "geo")
output_path_tab = os.path.join(output_path, "tab")

os.makedirs(data_path, exist_ok=True)
os.makedirs(input_path, exist_ok=True)
os.makedirs(output_path, exist_ok=True)
os.makedirs(output_path_geo, exist_ok=True)
os.makedirs(output_path_tab, exist_ok=True)

# Define qual o código IBGE do Estado
estado = 35

# Define URL
parameters = {
    "formato": "application/vnd.geo+json",
    "resolucao": "5",
    "qualidade": "4",
}
url = "https://servicodados.ibge.gov.br/api/v2/malhas/{}".format(estado)
r = requests.get(url, params=parameters)
print(r.url)

# Define o nome do arquivo que será salvo as informações do IBGE
geojson_file = os.path.join(input_path, "sp_ibge.geojson")

# Save
with open(geojson_file, "wb") as f:
    f.write(r.content)
