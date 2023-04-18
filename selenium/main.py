import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# driver inicializálása
driver = webdriver.Edge()

driver.set_window_size(1280,1024)

# Weboldal betöltése
driver.get('http://localhost:63342/ruhazati_weboldal/ferfi/index.html?_ijt=rf5s6meahvppe37aulkht7mcf5&_ij_reload=RELOAD_ON_SAVE')

time.sleep(1)
driver.save_screenshot("elso_latasra.png")
time.sleep(1)

#Rapid Ninja-s merchek keresése
rn_merch = driver.find_element(By.XPATH, '//a[text()="RN Cuccok"]')


# Kattintás a cuccokra
rn_merch.click()
time.sleep(1)
driver.save_screenshot("rn-es_merchek.png")
time.sleep(1)
rn_merch.click()
time.sleep(1)


#tigene apánkkal nincs bírás, neki is vannak cuccai a shopban!
keresosav = driver.find_element(By.XPATH, '//input[@placeholder="Keresés"]')
keresosav.send_keys("tigene")
time.sleep(2)
driver.save_screenshot("tigene_apank_cuccai.png")

keresosav.clear()
keresosav.send_keys("")

time.sleep(2)
cipok = driver.find_element(By.XPATH, '//a[text()="Férfi cipők"]')

# Kattintás a cuccokra
cipok.click()
time.sleep(1)
meret = driver.find_element(By.XPATH, '//input[@id="size_checkbox44"]')
driver.execute_script("arguments[0].checked = true;", meret)
time.sleep(1)
driver.save_screenshot("44-as_ferfi_cipok.png")
time.sleep(1)

nadrag = driver.find_element(By.XPATH, '//a[text()="Nadrágsz"]')

nadrag.click()

#Keressünk valami fekete vagy színes nadrágot és cipőt 11 ezer forint alatt ár szerint növekvő sorrendben
ar_csuszka = driver.find_element(By.XPATH, '//input[@id="max_price_input"]')
driver.execute_script("arguments[0].value = '11000'", ar_csuszka)

fekete = driver.find_element(By.XPATH, '//input[@id="color_black"]')
szines = driver.find_element(By.XPATH, '//input[@id="color_colorful"]')

driver.execute_script("arguments[0].checked = true;", fekete)
driver.execute_script("arguments[0].checked = true;", szines)

elem = driver.find_element(By.XPATH, '//option[text()="Relevancia"]')
elem.click()
time.sleep(1)
elem = driver.find_element(By.XPATH, '//option[text()="Ár szerint növekvő"]')
elem.click()

time.sleep(1)
driver.save_screenshot("11_ezer.png")

nezzuk_meg_kozelebbrol = driver.find_element(By.XPATH, '//h3[text()="ch-091 black"]')
nezzuk_meg_kozelebbrol.click()
time.sleep(1)
vasarlas = driver.find_element(By.XPATH, '//span[@id="modal_action_font"]')
time.sleep(1)
vasarlas.click()
time.sleep(1)

driver.save_screenshot("nem_sikerult_vasarlas.png")

time.sleep(1)
# Driver bezárása
driver.quit()
