import streamlit as st
import google.generativeai as genai

# 1. Pagina instellingen (Titel en tabblad)
st.set_page_config(page_title="RV Invoicing", page_icon="🧾", layout="centered")

# 2. Titel van de applicatie op de webpagina
st.title("🧾 RV Invoicing App")
st.write("Vul de gegevens van de klant en de werkzaamheden in om automatisch een factuur te genereren.")

# 3. Verbinden met het Google AI (Gemini) model
# We halen de API-sleutel uit de beveiligde 'secrets' van Streamlit
genai.configure(api_key=st.secrets["GEMINI_API_KEY"])

# Je kunt hier het model aanpassen als je in AI Studio een andere versie gebruikte
model = genai.GenerativeModel('gemini-1.5-flash')

# 4. Interface: Invoerveld voor de gebruiker
user_input = st.text_area(
    "Wat moet er op de factuur komen?", 
    height=150, 
    placeholder="Bijv: Klant X, 4 uur consultancy, uurtarief €85..."
)

# 5. Actie: Wat gebeurt er als we op de knop klikken?
if st.button("Genereer Factuur", type="primary"):
    if user_input:
        # Toon een laad-icoontje terwijl de AI nadenkt
        with st.spinner("Factuur wordt gegenereerd... even geduld."):
            
            # --- JOUW AI STUDIO PROMPT ---
            # Hier combineer je jouw originele AI Studio prompt met de input van de gebruiker
            prompt = f"""
            Jij bent een professionele assistent voor RV Services. 
            Genereer een formele, correcte factuur op basis van de volgende gegevens:
            
            {user_input}
            """
            
            # Stuur het naar de AI
            response = model.generate_content(prompt)
            
            # 6. Toon het resultaat op de webpagina
            st.success("Factuur succesvol gegenereerd!")
            st.markdown("### Resultaat:")
            st.write(response.text)
    else:
        st.warning("Vul alsjeblieft eerst de gegevens in voordat je op de knop klikt.")