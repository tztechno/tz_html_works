import streamlit as st

def main():
    st.set_page_config(page_title="My Apps")

    st.title("My Apps")
    st.write("---")

    st.sidebar.title("Sidebar")
    st.sidebar.write("- [Recent Earthquake](https://tztechno.github.io/tz_js_20240217_leaflet/emap_now4.html)")
    st.sidebar.write("- [Tarot Reading](https://app-tarrot-reading-mlnessbppgllzg2dns5pfc.streamlit.app)")
    st.sidebar.write("- [Tags Remover](https://app-tags-remover-sbkxegmeb9kavsurgowb6d.streamlit.app/)")

    st.write("---")

    st.header("Main Content")

    st.subheader("Recent Earthquake")
    st.markdown("""
        Displays earthquakes that occurred around Japan in the past month, color-coded by magnitude. Large earthquakes often
        occur within the range of earthquake swarms, so by checking this, you can find out the danger range.
        [Link to App](https://tztechno.github.io/tz_js_20240217_leaflet/emap_now4.html)
    """)

    st.subheader("Tarot Reading")
    st.markdown("""
        You can do tarot reading by yourself. Cards predict your past, present, and future.
        [Link to App](https://app-tarrot-reading-mlnessbppgllzg2dns5pfc.streamlit.app)
    """)

    st.subheader("Tags Remover")
    st.markdown("""
        Remove unnecessary line breaks, tabs, and spaces hidden in your text. Please use it when copying and pasting sentences.
        [Link to App](https://app-tags-remover-sbkxegmeb9kavsurgowb6d.streamlit.app/)
    """)

    st.write("---")

    st.write("2024 My Apps")

if __name__ == "__main__":
    main()
