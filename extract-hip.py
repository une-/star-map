# extract CSV from topcat

# code to scrape common names from here: https://www.cosmos.esa.int/web/hipparcos/common-star-names
'''
let rows = temp0.querySelectorAll('tr'); // temp0 should be the tbody

let result = '';
for (var i = 2; i < rows.length; i++) {
    let columns = [...rows[i].querySelectorAll('td')].map((td) => td.innerText);
    result += `${columns[1]}: "${columns[0]}",\n`
    result += `${columns[3]}: "${columns[2]}",\n`
}
console.log(result);
'''

common_names = {
    13847: "Acamar",
    57939: "Groombridge 1830",
    7588: "Achernar",
    68702: "Hadar",
    60718: "Acrux",
    9884: "Hamal",
    33579: "Adhara",
    72105: "Izar",
    68702: "Agena",
    24186: "Kapteyn's star",
    95947: "Albireo",
    90185: "Kaus Australis",
    65477: "Alcor",
    72607: "Kocab",
    17702: "Alcyone",
    110893: "Kruger 60",
    21421: "Aldebaran",
    36208: "Luyten's star",
    105199: "Alderamin",
    113963: "Markab",
    1067: "Algenib",
    59774: "Megrez",
    50583: "Algieba",
    14135: "Menkar",
    14576: "Algol",
    53910: "Merak",
    31681: "Alhena",
    25930: "Mintaka",
    62956: "Alioth",
    10826: "Mira",
    67301: "Alkaid",
    5447: "Mirach",
    9640: "Almaak",
    15863: "Mirphak",
    109268: "Alnair",
    65378: "Mizar",
    25428: "Alnath",
    25606: "Nihal",
    26311: "Alnilam",
    92855: "Nunki",
    26727: "Alnitak",
    58001: "Phad",
    46390: "Alphard",
    17851: "Pleione",
    76267: "Alphekka",
    11767: "Polaris",
    677: "Alpheratz",
    37826: "Pollux",
    98036: "Alshain",
    37279: "Procyon",
    97649: "Altair",
    70890: "Proxima",
    2081: "Ankaa",
    84345: "Rasalgethi",
    80763: "Antares",
    86032: "Rasalhague",
    69673: "Arcturus",
    30089: "Red Rectangle",
    25985: "Arneb",
    49669: "Regulus",
    112247: "Babcock's star",
    24436: "Rigel",
    87937: "Barnard's star",
    71683: "Rigil Kent",
    25336: "Bellatrix",
    109074: "Sadalmelik",
    27989: "Betelgeuse",
    27366: "Saiph",
    96295: "Campbell's star",
    113881: "Scheat",
    30438: "Canopus",
    85927: "Shaula",
    24608: "Capella",
    3179: "Shedir",
    746: "Caph",
    92420: "Sheliak",
    36850: "Castor",
    32349: "Sirius",
    63125: "Cor Caroli",
    65474: "Spica",
    98298: "Cyg X-1",
    97278: "Tarazed",
    102098: "Deneb",
    68756: "Thuban",
    57632: "Denebola",
    77070: "Unukalhai",
    3419: "Diphda",
    3829: "Van Maanen 2",
    54061: "Dubhe",
    91262: "Vega",
    107315: "Enif",
    63608: "Vindemiatrix",
    87833: "Etamin",
    18543: "Zaurak",
    113368: "Fomalhaut",
    60936: "3C 273"
}

def main():
    result = ''
    with open('hip.csv', 'r') as f:
        lines = f.readlines()[1:]
        for line in lines:
            id, ra, dec, paralax, *spectral_type = line.strip().split(',')
            spectral_type = ','.join(spectral_type)
            if ra == '' or dec == '' or paralax == '' or spectral_type == '" "' or spectral_type[0] == '(' or float(paralax) == 0: continue
            if spectral_type[0] == '"' and spectral_type[-1] == '"': spectral_type = spectral_type[1:-1]
            result += '\n'
            distance = (1000.0 / float(paralax)) * 3.26156
            name = f'HIP {id}'
            if int(id) in common_names: name = f'{common_names[int(id)]} ({name})'
            result += f'{{ name: "{name}", class: "{spectral_type[0].upper()}", distance: {distance}, rightAscension: {ra}, declination: {dec} }},'
    print(result)

if __name__ == '__main__': main()