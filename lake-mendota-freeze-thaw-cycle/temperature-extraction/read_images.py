import os
import glob
import re
import math
import tqdm
from PIL import Image, ImageDraw
import csv

# Threshold
	# 3-tuple of 2-tuples with the first value being -1 or 1 indicating whether
	# the value should be above or below to pass
	# the second value being min or max respectively
def isColor(color, threshold):
	for i in range(3):
		if not(threshold[i][0] * threshold[i][1] <= threshold[i][0] * color[i]):
			return False
	return True

def isLeapYear(year):
	return year % 4

def inBox(box, point):
	p1 = (box[0], box[1])
	p2 = (box[2], box[3])

	if point[0] > p1[0] and point[0] < p2[0] \
		and point[1] > p1[1] and point[1] < p2[1]:
		return True
	return False


directories = {
	'images': './images/',
	'imageTest': './images/demos/',
	'data': '../display/data/temperature/'
}
for key, value in directories.items():
	if not os.path.exists(value):
		os.makedirs(value)

temperatureScale = (-30, 100)

for imageName in tqdm.tqdm(glob.glob(directories['images'] + '*.gif')):
	year = int(re.search('[0-9]{4}', imageName).group(0))
	days = 365
	if isLeapYear(year):
		days = 366

	image = Image.open(imageName).convert('RGB')
	width, height = image.size

	temperatures = []

	# Find the extent of the orange grid
	maxOrange = [-1, -1]
	minOrange = [999999, 999999]

	# Orange is >100% red, > 50% green, <70% blue
	orange = ((1, 255), (1, 127.5), (-1, 178.5))
	# Black is all colors < 50%
	black = ((-1, 127.5), (-1, 127.5), (-1, 127.5))
	red = ((1, 255), (-1, 5), (-1, 5))
	blue = ((-1, 5), (-1, 5), (1, 255))

	for x in range(width):
		for y in range(height):
			color = image.getpixel((x, y))
			if isColor(color, orange):
				if x < minOrange[0]:
					minOrange[0] = x
				if y < minOrange[1]:
					minOrange[1] = y

				if x > maxOrange[0]:
					maxOrange[0] = x
				if y > maxOrange[1]:
					maxOrange[1] = y

	width = maxOrange[0] - minOrange[0]
	height = maxOrange[1] - minOrange[1]

	# Figure out where the legend is by finding the largest orange free
	# rectangle within the orange grid
	bestWidth = 0
	bestPair = [-1,-1]

	startX = 0
	endX = 0

	startY = 0
	endY = 0

	for y in range(minOrange[1] + 50, maxOrange[1] - 50):
		for x in range(minOrange[0] + 50, maxOrange[0] - 50):
			if startX > 0:
				if isColor(image.getpixel((x, y)), orange):
					pairWidth = x - startX - 1

					if abs(startX - bestPair[0]) < 10 and abs(endX - bestPair[1]) < 10:
						endY = y
					elif pairWidth > bestWidth:
						bestWidth = pairWidth
						bestPair = [startX, x - 1]
						startY = y
						startX = x

					startX, endX = 0, 0
				else:
					endX = x
			else:
				startX = x

	# Never going to be meaningful data below the legend
	legendLocation = (bestPair[0] - 3, startY - 3, bestPair[1] + 3, endY + 3)

	draw = ImageDraw.Draw(image)

	# Get pixel extent of 1 day and 1 degree F
	dayWidth = width/days
	tempHeight = height/(temperatureScale[1] - temperatureScale[0])

	verticalBlackExtents = []

	# Find all vertical black lines. If multiple in same column, find the most
	# likely to be the temperature line based on position of neighbor(s)
	# to account for the legend box, freeze line, text, etc.
	# Drop any extent that's less than 3 degrees tall outright
	x = minOrange[0]
	while x <= maxOrange[0]:
		y = minOrange[1]

		possibleExtents = []
		currentExtent = []
		timeOut = 0

		# Look for black vertical lines, with affordance for the red
		# and blue lines and other interuptions
		while y <= maxOrange[1] and not (
			x > legendLocation[0] and x < legendLocation[2]
			and y > legendLocation[3]
		):
			if (
				isColor(image.getpixel((x, y)), black) or
				isColor(image.getpixel((x, y)), red) or
				isColor(image.getpixel((x, y)), blue)
			) and not inBox(
				legendLocation, (x, y)
			):
				if len(currentExtent) == 0:
					currentExtent.append(y)
					currentExtent.append(y)
				timeOut = 0
				currentExtent[1] = y
			elif len(currentExtent) > 0:
				if timeOut > math.ceil(tempHeight * 1) or \
				inBox(legendLocation, (x, y)):
					if currentExtent[1] - currentExtent[0] > tempHeight * 3 \
					and not (
						inBox(legendLocation, (x, currentExtent[0] + 2)) or
						inBox(legendLocation, (x, currentExtent[1] - 2))
					):
						possibleExtents.append([currentExtent[0], currentExtent[1]])
					currentExtent = []
				else:
					timeOut += 1
			y += 1
		if len(currentExtent) > 0 and currentExtent[1] - currentExtent[0] > tempHeight * 3:
			possibleExtents.append([currentExtent[0], currentExtent[1]])

		for extent in possibleExtents:
			draw.line((x, extent[0], x, extent[1]), (255, 0, 255))

			if len(possibleExtents) > 0:
				bestExtent = possibleExtents[0]
				bestDistance = bestExtent[1] - bestExtent[0]

				for extent in possibleExtents:
					curExtentDistance = extent[1] - extent[0]

					if curExtentDistance > bestDistance:
						bestDistance = curExtentDistance
						bestExtent = extent

				verticalBlackExtents.append(bestExtent)
				draw.line((x, bestExtent[0], x, bestExtent[1]), (255, 255, 0))
			else:
				verticalBlackExtents.append(None)
		x += 1

	data = [['day', 'max_temp', 'min_temp']]
	prevExtent = None
	i = 0
	for extent in verticalBlackExtents:
		if prevExtent is None:
			prevExtent = [extent]
		else:
			if prevExtent[0] == extent[0] and prevExtent[1] == extent[1]:
				extent = None

		if extent is None:
			data.append([(i*365)/len(verticalBlackExtents), None, None])
		else:
			data.append([
				(i*365)/len(verticalBlackExtents),
				temperatureScale[1] - (extent[0] - minOrange[1])/tempHeight,
				temperatureScale[1] - (extent[1] - minOrange[1])/tempHeight
			])
		i += 1

	with open(directories['data'] + str(year) + '.csv', 'w+') as file:
		writer = csv.writer(file)
		writer.writerows(data)

	draw.line((bestPair[0], startY, bestPair[1], endY), fill = (255, 0, 255))
	image.save(directories['imageTest'] + str(year) + '.gif')
