import flask
from flask import request, Response
import time
import json
import requests
import random
import copy
from flask_cors import CORS

app = flask.Flask(__name__)
CORS(app)
app.config["DEBUG"] = True

obj = {}
obj['index'] = 0
index = 0
positions = []
imsi_prefix = '000000000000'
additionalUeIds = []
for i in range(1, 10): # additional UEs
  additionalUeIds.append(imsi_prefix + str(i))
cur_uav_position = {}
cells = ['546573000031323', '546573000031324', '546573000031325']

f = open('cell_keys.json', 'r')
cell_keys = ''.join(f.read().split('\n'))
f.close()

f = open('cell_values.json', 'r')
cell_values = json.loads(''.join(f.read().split('\n')))
f.close()

f = open('bwp_example.json', 'r')
bwp_data = json.loads(''.join(f.read().split('\n')))
f.close()

f = open('ue_amf_mapping.json', 'r')
ue_amf_data = ''.join(f.read().split('\n'))
f.close()

f = open('env_ho.json', 'r')
env_ho_data = ''.join(f.read().split('\n'))
f.close()

f = open('env_bwp.json', 'r')
env_bwp_data = ''.join(f.read().split('\n'))
f.close()

f = open('xapp_catalog.json', 'r')
xapp_data = json.loads(''.join(f.read().split('\n')))
backup_xapps = {}
f.close()

f = open('deployed_xapps.json', 'r')
deployed_xapps = json.loads(''.join(f.read().split('\n')))
xApp_name = set()
for data in deployed_xapps:
  xApp_name.add(data['name'])
f.close()

# e2 node
f = open('e2_nodes.json', 'r')
e2_nodes_data = ''.join(f.read().split('\n'))
f.close()

f = open('ue_throughput.json', 'r')
throughput_data = json.loads(''.join(f.read().split('\n')))
f.close()

# prometheus data
f = open('ue_prometheus_example.json', 'r')
ue_prometheus_data = json.loads(''.join(f.read().split('\n')))
f.close()

f = open('cell_prometheus_example.json', 'r')
cell_prometheus_data = json.loads(''.join(f.read().split('\n')))
f.close()

bouncer_prometheus_data = copy.deepcopy(cell_prometheus_data)
arr = bouncer_prometheus_data['data']['result']
while len(arr) > 1:
  arr.pop()
arr[0]['metric']['id'] = 'time (us)'

def readPosition():
  pos = positions[obj['index']]
  obj['index'] += 1
  if obj['index'] == len(positions):
    obj['index'] = 0
  return pos

def readPositionOffset(offset):
  index = obj['index'] + offset
  if index >= len(positions):
    index -= len(positions)
  jsonObj = json.loads(positions[index])
  return jsonObj['tags'][0]

@app.route('/ms/current_position', methods=['GET'])
def ms_current_position():
  global cur_uav_position
  posData = json.loads(readPosition())
  count = 1
  for i in additionalUeIds:
    posData['tags'].append(readPositionOffset(20 * count))
    posData['tags'][count]['ueId'] = i
    posData['tags'][count]['posZ'] = 10
    count += 1

  posData['tags'][0]['ueId'] = '0000000000000'
  posData['tags'][0]['posZ'] = 10
  # build new data structure
  sdlData = []
  for i in range(len(posData['tags'])):
    sdlData.append({})
    sdlData[i]['pci'] = 201508
    sdlData[i]['meas_timestamp_pos'] = {}
    sdlData[i]['meas_timestamp_pos']['sec'] = 123
    sdlData[i]['meas_timestamp_pos']['nsec'] = 456
    sdlData[i]['pos_x'] = posData['tags'][i]['posX']
    sdlData[i]['pos_y'] = posData['tags'][i]['posY']
    sdlData[i]['pos_z'] = posData['tags'][i]['posZ']
    sdlData[i]['ue_imsi'] = posData['tags'][i]['ueId']
  cur_uav_position = json.dumps(sdlData)
  return cur_uav_position

@app.route('/ms/current_position_copy', methods=['GET'])
def ms_current_position_copy():
  return cur_uav_position

@app.route('/ho_perf_ns/ho_perf')
def ho_process_time():
  data = []
  hoTime = {}
  hoTime['ho_perf_time'] = random.randint(10000, 30000)
  data.append(hoTime)
  return json.dumps(data)

@app.route('/bwp_perf_ns/bwp_perf')
def bwp_process_time():
  data = []
  hoTime = {}
  hoTime['bwp_perf_time'] = random.randint(10000, 30000)
  data.append(hoTime)
  return json.dumps(data)

@app.route('/mqtt_ns/<ue_id>')
def ue_throughput(ue_id):
  for data in throughput_data:
    data['throughput'] = random.randint(0, 6250000)
  return json.dumps(throughput_data)

@app.route('/TS-UE-metrics/<typ>')
def ue_bwp(typ):
  # randomize serving cells
  for data in bwp_data:
    data["Serving-Cell-ID"] = random.choice(cells)
  return json.dumps(bwp_data)

@app.route('/TS-cell-metrics/<typ>')
def cell_data(typ):
  if typ == 'keys':
    return cell_keys
  else:
    # randomize cell loading
    for data in cell_values:
      data["Avail-PRB-DL"] = random.randint(0, 100)
    return json.dumps(cell_values)

@app.route('/amf_ns/ue_amf')
def ue_amf():
  return ue_amf_data

@app.route('/env_ns/ho_env_info')
def env_ho():
  return env_ho_data

@app.route('/bwp_env_ns/bwp_env_info')
def env_bwp():
  return env_bwp_data

@app.route('/onboard/download', methods=['POST'])
def onboard_xapp():
  data = request.get_json()
  if 'config-file.json_url' not in data or not data['config-file.json_url']:
    return Response(400, 'config not valid')
  # just return ok
  return ''

@app.route('/xapp/catalog')
def xapp_catalog():
  return json.dumps(xapp_data)

@app.route('/xapp/deployed')
def get_deployed_xapps():
  return json.dumps(deployed_xapps)

@app.route('/deploy_xapp', methods=['POST'])
def deploy_xapp():
  data = request.get_json()
  xapp_name = data['xappName']
  if xapp_name in backup_xapps:
    deployed_xapps.append(backup_xapps[xapp_name])
    del backup_xapps[xapp_name]
    return ''
  elif xapp_name in xApp_name:
    # already deployed
    return Response(400, 'xApp already deployed')
  else:
    # no such xApp name, return 400 bad request
    return Response(400, 'xApp not found')

@app.route('/delete_xapp/<xapp_name>', methods=['DELETE'])
def delete_xapp(xapp_name):
  index = 0
  while index < len(deployed_xapps):
    data = deployed_xapps[index]
    if data['name'] == xapp_name:
      # xapp found
      backup_xapps[xapp_name] = data
      deployed_xapps.pop(index)
      break
  return ''

@app.route('/e2mgr/v1/nodeb/states')
def get_nodeb():
  return e2_nodes_data

@app.route('/prometheus/<itemName>/<timeBefore>/<timeTo>/<granularity>')
def prometheus(itemName, timeBefore, timeTo, granularity):
  if itemName.startswith('ue'):
    new_data = copy.deepcopy(ue_prometheus_data)
  elif itemName.startswith('cell'):
    new_data = copy.deepcopy(cell_prometheus_data)
  else:
    # bouncer
    new_data = bouncer_prometheus_data
  for data in new_data['data']['result']:
    data['values'] = []
    before, to, steps = int(timeBefore), int(timeTo), int(granularity)
    while before <= to:
      data['values'].append([before, str(random.randint(0, 100))])
      before += steps
  return json.dumps(new_data)

@app.route('/Bouncer/process_time')
def bouncer():
  data = []
  obj = {}
  obj['time'] = random.randint(0, 10000)
  data.append(obj)
  return json.dumps(data)

f = open("compal_traj.txt", "r")
positions = f.read().split('\n')
positions.pop()
f.close()
app.run(host='0.0.0.0', port=8888)

