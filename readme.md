# balansertefakta

Et hierarkisk, balansefokusert sosialt nettverk for strukturerte samfunnsdiskusjoner med eksplisitte for- og motargumenter, sporbare kilder og alltid synlige motstemmer.

---

## 1. Formål

balansertefakta skal gjøre det mulig å:

* Diskutere komplekse samfunnstemaer uten å miste nyanser
* Skille klart mellom fakta, tolkning og verdier
* Alltid eksponere brukere for kvalifiserte motargumenter ("steelman")
* Diskutere *både* påstander *og* kilder på en presis måte
* La brukere filtrere informasjon basert på egen epistemisk policy

Systemet er bygget for å fremme forståelse fremfor polarisering.

---

## 2. Overordnet struktur

### 2.1 Navigasjon: Trestruktur

Temaer organiseres i en hierarkisk trestruktur:

* Topic (f.eks. Global oppvarming)

  * Subtopic (f.eks. Årsaker)

    * Question (f.eks. "Er menneskelig aktivitet hovedårsaken?")

      * Claims / Measures

Denne strukturen brukes for navigasjon og oversikt.

### 2.2 Innhold: DAG (Directed Acyclic Graph)

Underliggende innhold (påstander, argumenter, kilder) er modellert som en DAG:

* Samme claim, argument eller tiltak kan refereres fra flere steder
* Unngår duplisering og fragmentering
* Sikrer konsistente oppsummeringer på tvers av temaer

---

## 3. Datamodell / Nodetyper

### 3.1 Tema og spørsmål

* **Topic**: Overordnet tema
* **Subtopic**: Undertema
* **Question**: Avgrenset, diskuterbart spørsmål

### 3.2 Påstander og tiltak

* **Claim**: Falsifiserbar påstand
* **Measure / Policy**: Konkret tiltak eller handlingsforslag

### 3.3 Argumentasjon

* **Argument**: Pro- eller contra-argument knyttet til en claim eller measure
* **Counterposition**: Beste tilgjengelige motposisjon (steelman)

### 3.4 Evidens og kilder

Kilder splittes eksplisitt i flere nivåer:

* **Domain**: f.eks. nrk.no
* **Outlet / Section**: f.eks. NRK Klima, NRK Debatt
* **Artifact**: konkret artikkel, studie, video (URL + metadata)
* **Extract**: sitat, avsnitt, figur eller datapunkt med presis referanse
* **Evidence link**: kobling mellom extract og claim/argument

### 3.5 Meta-noder

* **Summary**: Strukturert oppsummering av pro- og contra-siden
* **Open questions**: Hva er uavklart? Hvilke data mangler?

---

## 4. Balanse som systemregel

Balanse er ikke bare et UI-valg, men en eksplisitt kontrakt i systemet:

* Alle Questions og Claims må ha:

  * Minst ett kvalifisert pro-argument
  * Minst ett kvalifisert contra-argument
* "Moden" status kan ikke oppnås uten dokumentert motposisjon
* Motstemmer kan ikke skjules helt i UI (kun minimeres)

---

## 5. Oppsummeringer

### 5.1 Krav til oppsummering

Alle oppsummeringer må inneholde:

* **Pro-siden**: 3–7 hovedpunkter
* **Contra-siden**: 3–7 hovedpunkter
* Hvert punkt må lenkes til 1–N Evidence/Extracts
* **Uenighetsanalyse**:

  * Uenighet om data
  * Uenighet om tolkning
  * Uenighet om verdier/risiko
* **Uavklarte spørsmål**

### 5.2 Historikk

* Oppsummeringer er versjonerte
* Full diff og audit trail er tilgjengelig

---

## 6. Diskusjon av kilder

Alle kilder kan diskuteres, på tre akser:

1. **Troverdighet**

   * Metode
   * Interessekonflikter
   * Historikk
2. **Relevans**

   * Svarer kilden faktisk på påstanden?
3. **Nøyaktighet**

   * Feil
   * Cherry-picking
   * Feilsitering

Feilsitering ("kilden sier ikke det du påstår") er en førsteklasses operasjon i systemet.

---

## 7. Filtrering og epistemiske policyer

Brukere filtrerer ikke bare på en slider, men velger policy:

Eksempler:

* Kun fagfellevurderte studier
* Vis alt, men marker lav kvalitet
* Skjul spesifikke domener (f.eks. nrk.no)
* Vektlegg uavhengige kilder
* Konflikt-alarm ved svake kilder

Policyene påvirker visning, ikke underliggende data.

---

## 8. Ståsted og visualisering

* Ståsted er:

  * Per spørsmål (ikke globalt)
  * Med styrke (lav / medium / høy)
  * Med begrunnelse (data / verdier / risiko)

Visualisering lar brukere:

* Fokusere på eget ståsted
* Sammenligne med motposisjoner
* Utforske hvor uenigheten faktisk ligger

---

## 9. Autentisering og rettigheter

Autentisering er knyttet til *rettigheter*, ikke status:

* **Anonym / lav-friksjon**

  * Lese
  * Foreslå innhold
  * Stemme på kvalitet
* **Verifisert (epost/telefon)**

  * Poste argumenter
* **Sterk ID (BankID)**

  * Bidra til oppsummeringer
  * Promotere noder til moden status
  * Delta i tvister

Ekspert-badges kan eksistere, men er alltid transparente og diskuterbare.

---

## 10. Moderasjon

Moderasjon fokuserer på *form*, ikke mening:

* Påstander må være falsifiserbare eller merket som verdi
* Argumenter må kunne forankres i evidens
* Personangrep avvises
* Lav-innsatsinnhold kan postes, men teller ikke i oppsummeringer

---

## 11. Brukerbegrensninger

* Brukere har et diskusjons- og bidragsbudsjett
* Budsjettet øker med dokumentert kvalitetsbidrag
* Kvalitet vurderes av:

  * Andre brukere
  * Moderasjon
  * Historisk presisjon

---

## 12. API-design

### 12.1 Prinsipper

* Event-sourcing
* Immutable hendelser
* Full audit trail

### 12.2 Eksempler på hendelser

* create_topic
* add_claim
* add_argument
* link_evidence
* challenge_source
* update_summary

### 12.3 Views

* Materialiserte views for rask UI
* Citation graph-endpoints
* Full historikk og diff

---

## 13. CLI og agent-integrasjon

### 13.1 CLI

* Egen bruker per maskin
* Begrenset skriveadgang
* Fokus på research og utkast

### 13.2 Claude Code / agent-kontrakt

Agenten må:

* Produsere:

  * 5–15 kilder
  * Pro- og contra steelman
  * Uenighetsanalyse
* Merke:

  * Fakta
  * Tolkning
  * Verdier
* Dokumentere svakheter ved egne kilder
* Aldri publisere direkte til moden status

Alt agentinnhold er utkast som krever menneskelig godkjenning.

---

## 14. Uenighetsdiagnose (Kjernefeature)

Systemet skal kunne vise *hvorfor* folk er uenige:

* Forskjellig datasett
* Forskjellig tolkning
* Forskjellige verdier
* Forskjellige definisjoner

Målet er å flytte diskusjoner fra "hvem har rett" til "hva er vi faktisk uenige om".

---

## 15. Prinsipp

> Ingen påstand uten motstemme.
> Ingen oppsummering uten kilder.
> Ingen autoritet uten transparens.

balansertefakta er et forsøk på å bygge digital offentlighet som tåler uenighet.
