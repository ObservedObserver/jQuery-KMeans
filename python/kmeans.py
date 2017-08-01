from PIL import Image, ImageDraw
import random, math
img = Image.open("psb.jpg")
draw = ImageDraw.Draw(img)

width = img.size[0]
height = img.size[1]
pix = img.load()

points = []
for x in range(0,width):
    for y in range(0,height):
        point = {}
        point["color"] = [(pix[x,y][i]/255)*2.3 for i in range(0,3)]
        point["pos"] = [x/width,y/height]
        points.append(point)

class KMeans():
    def __init__(self, k, points, size):
        self.K = k
        self.points = points
        self.size = size
        # self.centers = [{
        #     "pos":[int(random.random()*self.size[0]),int(random.random()*self.size[1])],
        #     "color":[int(random.random()*self.size[2]),int(random.random()*self.size[3]),int(random.random()*self.size[4])],
        # } for i in range(0,self.K)]
        self.centers = [{
            "pos":[random.random(),random.random()],
            "color":[random.random(),random.random(),random.random()],
        } for i in range(0,self.K)]
    def classify(self):

        for point in self.points:
            dis = []
            # print(point)
            for center in self.centers:
                sq = 0
                sq += (point["pos"][0]-center["pos"][0])*(point["pos"][0]-center["pos"][0])
                sq += (point["pos"][1]-center["pos"][1])*(point["pos"][1]-center["pos"][1])
                sq += (point["color"][0]-center["color"][0])*(point["color"][0]-center["color"][0])
                sq += (point["color"][1]-center["color"][1])*(point["color"][1]-center["color"][1])
                sq += (point["color"][2]-center["color"][2])*(point["color"][2]-center["color"][2])
                dis.append((math.sqrt(sq),self.centers.index(center)))#could be better without .index
            point["belong"] = min(dis)[1]
            # print(point)
        for i in range(0,len(self.centers)):
            ave = [0,0,0,0,0]
            tot = 0
            for point in self.points:
                # print(point)
                if point["belong"] == i:
                    ave[0] += point["pos"][0]
                    ave[1] += point["pos"][1]
                    ave[2] += point["color"][0]
                    ave[3] += point["color"][1]
                    ave[4] += point["color"][2]
                    tot += 1
            for j in range(0,5):
                ave[j] /= tot
            self.centers[i] = {
                "pos":[ave[0],ave[1]],
                "color":[ave[2],ave[3],ave[4]]
            }


tmp = KMeans(3,points,[width,height,255,255,255])
text = open("border.csv","w")
text.write("id,x,y,r,g,b,belong,time\n")
for w in range(0,10):
    print(w)
    tmp.classify()
    # i = 0
    # for point in tmp.points:
    #     text.write(str(i)+",")
    #     text.write(str(round(point["pos"][0]*width))+",")
    #     text.write(str(round(point["pos"][1]*height))+",")
    #     text.write(str(round(point["color"][0]*255))+",")
    #     text.write(str(round(point["color"][1]*255))+",")
    #     text.write(str(round(point["color"][2]*255))+",")
    #     text.write(str(round(point["belong"]))+",")
    #     text.write(str(w)+"\n")
    #     i += 1

i = 0
for point in tmp.points:
    # print(str(point["pos"][0]))
    text.write(str(i)+",")
    text.write(str(round(point["pos"][0]*width))+",")
    text.write(str(round(point["pos"][1]*height))+",")
    text.write(str(round(point["color"][0]*255))+",")
    text.write(str(round(point["color"][1]*255))+",")
    text.write(str(round(point["color"][2]*255))+",")
    text.write(str(round(point["belong"]))+"\n")
    i += 1
text.close()
