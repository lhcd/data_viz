import requests
import os
import time
import tqdm

urlStem = 'http://www.aos.wisc.edu/%7Esco/clim-history/stations/msn/msn-tts-'
imageDirectory = './images/'
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
yearRange = range(1971, 2019)

if not os.path.exists(imageDirectory):
	os.makedirs(imageDirectory)

for year in tqdm.tqdm(yearRange):
	url = urlStem + str(year) + '.gif'
	with open(imageDirectory + str(year) + '.gif', 'wb') as image:
		result = requests.get(url, headers = headers)
		image.write(result.content)
		time.sleep(1)