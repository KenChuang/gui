import time
import requests

obj = {}
obj['index'] = 0
index = 0
positions = []

def readPosition():
  pos = positions[obj['index']]
  obj['index'] += 1
  if obj['index'] == len(positions):
    obj['index'] = 0
  return pos

def ms_position():
  posData = readPosition().split('\t')
  return posData

f = open("UE_Position.txt", "r")
positions = f.read().split('\n')
f.close()
ts = time.time()
sec = int(ts)
nsec = int((ts - sec) * 1000000000)
posData = ms_position()
putData = {'ue_id': '001', 'meas_timestamp_pos': {'sec': sec, 'nsec': nsec}, 'pos_x': posData[1], 'pos_y': posData[2], 'pos_z': posData[3]}
requests.put("http://10.233.60.157:10000/a1-p/ue_position/001", data=putData)
