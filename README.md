# Témabejelentő
A szakdolgozatom témája egy többjátékos kártyajáték keretrendszer elkészítése webes technológiák alkalmazásával. Egy alapot nyújt
különböző francia kártyával játszott kártyajátékok elkészítéséhez és játszásához. A rendszerben így elérhető egy szerkesztő mód és egy
játék mód.
A szerkesztő felületen lehet új játékot definiálni, egy sajátot szerkeszteni vagy egy már meglévő hivatalos játékból kiindulni. Itt
különböző logikai szabályok és akciók összekapcsolásával lehet leírni egy játék menetét, például: megfordul a kör, következő játékos
felhúz X kártyát, kiválasztott játékos felhúzza az asztalra letett kártyákat, kiválasztott játékos nyert, játék vége, általános szabály
megváltoztatása stb. A szabályok lehetnek általános szabályok vagy kártyaszabályok, amik csak egyes kártyák lerakása, felhúzása,
birtoklása esetén élesek. Mentés csak bejelentkezett felhasználók részére lehetséges, ami után kártyajátékuk megtalálható lesz a saját
játékok menüpont alatt. Előre elkészített játék a hollandkocsma nevű kártyajáték, ennek segítségével mintát nyújtok a játékok
készítésére.
A játék felületen a játékcsomag kiválasztása után lehet egy nyilvános vagy rejtett szobát készíteni, amibe beléphet a többi játékos. Ezek
lehetnek hivatalos, admin által elfogadott, jól érthető játékok, vagy a felhasználó által készített saját kártyajátékok.
Játék közben az “asztal” és egy chat ablak látható. Az asztalon megjelennek a saját kártyák, a többi játékos neve, játéktól függően a
pakli, asztalra helyezett lapok, többi játékos kártyáinak száma, illetve a kártyák elrejtve vagy megjelenítve. A chat ablakon kívül
különböző reakciógombokkal is jelezhetnek egymásnak a résztvevők.
A játék vége után lehetőségük van újrakezdeni, és visszajelzést kapnak arról, hogy ki hányszor nyert.

<img width="720" alt="Screenshot 2023-07-10 at 0 46 36" src="https://github.com/rbencii/szakdolgozat/assets/83843622/704e51cb-94b5-45aa-8e36-2a107c6a96ae">

# Telepítés és futtatás
A többjátékos kártyajáték keretrendszer teljes telepítése 5 fő lépésből áll:
1. Supabase projekt felállítása
2. Adatbázis konfigurálása
3. Futtatási környezet telepítése
4. A szerverprogram telepítése
5. Az API-hoz szükséges adatok megadása
   
## Supabase projekt felállítása
Egy új projekt készítéséhez először egy [organizációt](https://app.supabase.com/new) kell létrehozni. Itt egy név megadása után egyből átirányít az új projekt oldalra. Az új projekt oldalon szintén egy név megadására, és egy adatbázis jelszó generálására kerül sor. Ezek után létrehozható az új projekt.

## Adatbázis konfigurálása
Az adatbázis konfigurálásának követelménye a PostgreSQL telepítése, ez elérhető a következő hivatkozáson: [https://www.postgresql.org/download/](https://www.postgresql.org/download/).


A konfiguráció a parancssoron és a projekt Dashboard-on keresztül végezhető el. A táblák elkészítésére és adatokkal való feltöltésére egy psql
parancs futtatása ad lehetőséget. Ennek folyamata a tobbjatekos-kartyajatek-keretrendszer mappából futtatott következő parancs:
`psql --single-transaction --variable ON\_ERROR\_STOP=1 --file roles.sql --file schema.sql --file data.sql --dbname "SAJAT ADATBAZIS URI"`

A saját adatbázis URI a [https://supabase.com/dashboard/project/_/settings/database](https://supabase.com/dashboard/project/_/settings/database) hivatkozáson megjelenő "Connection String" ablak "URI" gombjának megnyomásával érhető el. Ennek a "[YOUR-PASSWORD]" részét ki kell cserélni az adatbázis jelszavára.

<img width="427" alt="uri" src="https://github.com/rbencii/szakdolgozat/assets/83843622/f7de4738-7e2f-410a-9688-5c0114d12c64">


A táblák létrehozása után a valós idejű funkciók [támogatását](https://app.supabase.com/project/_/database/replication) engedélyeznünk kell.
Ehhez teendő lépések:

1. supabase_realtime jobb oldalán lévő "source" megnyitása
   
2. A következő táblázatok melletti jelölőnégyzetek engedélyezése:
- handview
- session
- session_players
- tableview
<img width="1448" alt="replication" src="https://github.com/rbencii/szakdolgozat/assets/83843622/3140c080-65b0-448f-8536-2c7be23e9035">
<img width="1131" alt="replication2" src="https://github.com/rbencii/szakdolgozat/assets/83843622/1018cbb7-426d-4c28-ac1e-0b7fba07d9c3">

## Futtatási környezet telepítése
A Node.js előző verziói a [https://nodejs.org/en/download/releases](https://nodejs.org/en/download/releases) hivatkozáson érhetőek el. Az operációs rendszernek megfelelő telepítő kiterjesztéssel rendelkező fájl segítségével telepíthető.

A telepítés után a verzió ellenőrzésére a "node -v" parancssori paranccsal lehetséges.

## A szerverprogram telepítése
A szerverprogram függőségeinek telepítése a Node Package Manager használatával történik. Ennek folyamata a tobbjatekos-kartyajatek-keretrendszer mappába navigálás utáni "npm i" parancssori parancs futtatása.

## Az API-hoz szükséges adatok megadása

Ahhoz, hogy a szerverprogram csatlakozni tudjon a Supabase projekthez, definiálni kell a megfelelő környezeti változókat. Az ehhez szükséges adatok a projekt [beállítások](https://app.supabase.com/project/_/settings/api) API részén elérhetőek.

A környezeti változók fájljának elérési útja a "tobbjatekos-kartyajatek-keretrendszer/.env.local". Itt a következőképpen kerülnek definiálásra a változók:

- NEXT_PUBLIC_SUPABASE_ANON_KEY legyen egyenlő a beállítások oldal "Project URL" részén megjelenő "anon public" kulccsal.
- NEXT_PUBLIC_SUPABASE_URL legyen egyenlő a beállítások oldal "Project API keys" részén megjelenő URL-lel.
- PRIVATE_SERVICE_KEY legyen egyenlő a beállítások oldal "Project API keys" részén elrejtett "service\_role" kulccsal.

## A szerver futtatása
A szerver futtatásához a tobbjatekos-kartyajatek-keretrendszer mappában kell végrehajtani két parancssori parancsot. Az első az "npm run build", ami az applikáció egy optimalizált változatát állítja elő. A második pedig az "npm run start", ami ezt a változatot futtatja.

