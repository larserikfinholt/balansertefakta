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

## 4. Datamodell: Detaljert beskrivelse

### 4.1 Påstandstyper (ClaimType)

Påstander klassifiseres i fem typer:

* **EMPIRICAL**: Observerbare fakta ("Global gjennomsnittstemperatur har økt med 1.1°C siden 1880")
* **CAUSAL**: Årsakssammenhenger ("CO₂-utslipp fra fossil energi driver den globale oppvarmingen")
* **PROGNOSTIC**: Prognoser og prediksjoner ("Temperaturen vil øke med 2-4°C innen 2100 ved business-as-usual")
* **NORMATIVE**: Verdier og hva som bør gjøres ("Vi har et moralsk ansvar overfor fremtidige generasjoner")
* **DEFINITIONAL**: Definisjoner og kategoriseringer ("En temperaturøkning over 2°C regnes som farlig klimaendring")

Denne inndelingen klargjør *hva slags* uenighet som finnes: Er vi uenige om data, årsakssammenhenger, prognoser, verdier, eller bare definisjoner?

### 4.2 Scope (Omfang og avgrensning)

Hver Question, Claim og Argument kan ha eksplisitt scope for å unngå forvirring:

#### Temporal Scope (Tidsmessig avgrensning)
* PRE_1900, EARLY_20TH_CENTURY, MID_20TH_CENTURY, LATE_20TH_CENTURY
* EARLY_21ST_CENTURY, CURRENT, NEAR_FUTURE, FAR_FUTURE, TIMELESS

Eksempel: "Hva var hovedårsaken til temperaturstigningen?" kan ha ulikt svar for 1950-1980 (sol) vs 1980-2020 (CO₂).

#### Geographic Scope
* GLOBAL, CONTINENTAL, NATIONAL, REGIONAL, LOCAL, SITE_SPECIFIC

Eksempel: En påstand om vindkraft kan være sann nasjonalt, men usann lokalt.

#### System Boundary (Systemgrenser)
* ISOLATED_SYSTEM: Ingen utveksling med omgivelsene
* CLOSED_SYSTEM: Energi inn/ut, men ikke masse
* OPEN_SYSTEM: Både energi og masse utveksles
* NESTED_SYSTEM: System innenfor et større system

Eksempel: En økonomisk analyse kan gi forskjellige svar avhengig av om man ser på bedrift (closed), region (open), eller globalt (nested).

### 4.3 Evidens-lenke styrke (LinkageStrength)

Evidenslenker mellom Extract og Claim/Argument har eksplisitt styrke:

* **DIRECT**: Direkte støtte ("studien konkluderer eksplisitt med dette")
* **INDIRECT**: Indirekte støtte ("studien viser relatert fenomen som impliserer dette")
* **CONSISTENT_WITH**: Konsistent med ("studien motsier ikke påstanden")
* **WEAKLY_INDICATIVE**: Svak indikasjon ("dette kan tyde på...")
* **MISUSED_OR_NOT_SUPPORTING**: Kilden støtter *ikke* påstanden (markering av feilsitering)

Dette gjør det mulig å:
* Utfordre feilsitering eksplisitt
* Skille mellom "beviser" og "konsistent med"
* Visualisere styrken på argumenter

### 4.4 Uenighet som egen entitet (Disagreement)

Uenighet er ikke bare metadata i oppsummeringer, men en førsteklasses struktur:

* **DATA_DISAGREEMENT**: Uenighet om fakta/data ("studier viser ulike tall")
* **INTERPRETATION_DISAGREEMENT**: Uenighet om tolkning ("enige om data, uenige om betydning")
* **VALUE_DISAGREEMENT**: Uenighet om verdier ("enige om konsekvenser, uenige om prioritering")
* **DEFINITIONAL_DISAGREEMENT**: Uenighet om definisjoner ("hva betyr egentlig 'bærekraft'?")
* **SCOPE_DISAGREEMENT**: Uenighet om avgrensning ("gjelder dette lokalt eller globalt?")

Hvert Disagreement er knyttet til Question, Claim eller Argument og kan dokumenteres med:
* En beskrivelse av hva det er uenighet om
* Hvilke posisjoner som finnes
* Kilder som støtter hver posisjon

**Nøkkelpoeng**: Målet er å flytte diskusjoner fra "hvem har rett" til "hva er vi faktisk uenige om".

### 4.5 UserStance: Delt vurdering

Brukerstillinger (UserStance) er splittet i deskriptiv og normativ vurdering:

#### Descriptive Assessment (Faktisk tilstand)
* STRONGLY_TRUE, LIKELY_TRUE, UNCERTAIN, LIKELY_FALSE, STRONGLY_FALSE

*Eksempel*: "Jeg tror det er LIKELY_TRUE at CO₂ driver oppvarmingen"

#### Normative Preference (Hva bør gjøres)
* STRONGLY_SUPPORT, SUPPORT, NEUTRAL, OPPOSE, STRONGLY_OPPOSE

*Eksempel*: "Men jeg OPPOSE politikken fordi kostnaden er for høy"

#### Justifications (Begrunnelser)
Hver stance kan ha flere begrunnelser:
* DATA_BASED: "Basert på disse studiene..."
* VALUE_BASED: "Basert på mine verdier om..."
* RISK_BASED: "På grunn av risikoen for..."
* PRAGMATIC: "Fordi det er praktisk gjennomførbart"
* PRINCIPLED: "Basert på prinsippet om..."

**Nøkkelpoeng**: Dette skiller "hva jeg tror er sant" fra "hva jeg mener bør gjøres", og eksplisitterer *hvorfor* jeg mener det.

### 4.6 MaturityChecklist

Hver Question har en automatisk beregnet modenhet basert på:

* **hasScope**: Er scope (temporal/geographic/system) definert?
* **hasDisagreementAxis**: Er hoveduenighet dokumentert?
* **hasProArguments**: Finnes minst ett pro-argument?
* **hasContraArguments**: Finnes minst ett contra-argument?
* **hasSupportingEvidence**: Er pro-argumenter støttet av evidens?
* **hasChallengingEvidence**: Er contra-argumenter støttet av evidens?
* **completenessScore**: 0-100 basert på ovenstående

Dette er kun *displayet til brukere* - ikke en hard constraint. En Question kan være DRAFT selv med lav score, men brukere ser tydelig hva som mangler.

### 4.7 Prisma Schema oversikt

Viktige enum-verdier:

```prisma
enum ClaimType {
  EMPIRICAL
  CAUSAL
  PROGNOSTIC
  NORMATIVE
  DEFINITIONAL
}

enum LinkageStrength {
  DIRECT
  INDIRECT
  CONSISTENT_WITH
  WEAKLY_INDICATIVE
  MISUSED_OR_NOT_SUPPORTING
}

enum TemporalScope {
  PRE_1900
  EARLY_20TH_CENTURY
  MID_20TH_CENTURY
  LATE_20TH_CENTURY
  EARLY_21ST_CENTURY
  CURRENT
  NEAR_FUTURE
  FAR_FUTURE
  TIMELESS
}

enum GeographicScope {
  GLOBAL
  CONTINENTAL
  NATIONAL
  REGIONAL
  LOCAL
  SITE_SPECIFIC
}

enum DisagreementType {
  DATA_DISAGREEMENT
  INTERPRETATION_DISAGREEMENT
  VALUE_DISAGREEMENT
  DEFINITIONAL_DISAGREEMENT
  SCOPE_DISAGREEMENT
}
```

Relational struktur:
* Question → Scope (1:1)
* Question → Disagreement[] (1:N)
* Question → UserStance[] (1:N)
* Claim → Scope (1:1)
* Argument → Scope (1:1)
* EvidenceLink.linkageStrength (erstatter supportStrength)

---

## 5. Balanse som systemregel

Balanse er ikke bare et UI-valg, men en eksplisitt kontrakt i systemet:

* Alle Questions og Claims må ha:

  * Minst ett kvalifisert pro-argument
  * Minst ett kvalifisert contra-argument
* "Moden" status kan ikke oppnås uten dokumentert motposisjon
* Motstemmer kan ikke skjules helt i UI (kun minimeres)

---

## 6. Oppsummeringer

### 6.1 Krav til oppsummering

Alle oppsummeringer må inneholde:

* **Pro-siden**: 3–7 hovedpunkter
* **Contra-siden**: 3–7 hovedpunkter
* Hvert punkt må lenkes til 1–N Evidence/Extracts
* **Uenighetsanalyse**:

  * Uenighet om data
  * Uenighet om tolkning
  * Uenighet om verdier/risiko
* **Uavklarte spørsmål**

### 6.2 Historikk

* Oppsummeringer er versjonerte
* Full diff og audit trail er tilgjengelig

---

## 7. Diskusjon av kilder

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

## 8. Filtrering og epistemiske policyer

Brukere filtrerer ikke bare på en slider, men velger policy:

Eksempler:

* Kun fagfellevurderte studier
* Vis alt, men marker lav kvalitet
* Skjul spesifikke domener (f.eks. nrk.no)
* Vektlegg uavhengige kilder
* Konflikt-alarm ved svake kilder

Policyene påvirker visning, ikke underliggende data.

---

## 9. Ståsted og visualisering

* Ståsted er:

  * Per spørsmål (ikke globalt)
  * Med styrke (lav / medium / høy)
  * Med begrunnelse (data / verdier / risiko)

Visualisering lar brukere:

* Fokusere på eget ståsted
* Sammenligne med motposisjoner
* Utforske hvor uenigheten faktisk ligger

---

## 10. Autentisering og rettigheter

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

## 11. Moderasjon

Moderasjon fokuserer på *form*, ikke mening:

* Påstander må være falsifiserbare eller merket som verdi
* Argumenter må kunne forankres i evidens
* Personangrep avvises
* Lav-innsatsinnhold kan postes, men teller ikke i oppsummeringer

---

## 12. Brukerbegrensninger

* Brukere har et diskusjons- og bidragsbudsjett
* Budsjettet øker med dokumentert kvalitetsbidrag
* Kvalitet vurderes av:

  * Andre brukere
  * Moderasjon
  * Historisk presisjon

---

## 13. API-design

### 13.1 Prinsipper

* Event-sourcing
* Immutable hendelser
* Full audit trail

### 13.2 Eksempler på hendelser

* create_topic
* add_claim
* add_argument
* link_evidence
* challenge_source
* update_summary

### 13.3 Views

* Materialiserte views for rask UI
* Citation graph-endpoints
* Full historikk og diff

---

## 14. CLI og agent-integrasjon

### 14.1 CLI

* Egen bruker per maskin
* Begrenset skriveadgang
* Fokus på research og utkast

### 14.2 Claude Code / agent-kontrakt

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

## 15. Uenighetsdiagnose (Kjernefeature)

Systemet skal kunne vise *hvorfor* folk er uenige:

* Forskjellig datasett
* Forskjellig tolkning
* Forskjellige verdier
* Forskjellige definisjoner

Målet er å flytte diskusjoner fra "hvem har rett" til "hva er vi faktisk uenige om".

---

## 16. Prinsipp

> Ingen påstand uten motstemme.
> Ingen oppsummering uten kilder.
> Ingen autoritet uten transparens.

balansertefakta er et forsøk på å bygge digital offentlighet som tåler uenighet.
