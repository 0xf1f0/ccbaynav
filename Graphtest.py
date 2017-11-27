import json
import matplotlib.pyplot as plt

db = json.load(open('aransas_pass.json'))

x =[]
y =[]

plt.plot(x,y,label='line one')


plt.title('Wind Speed')
plt.ylabel('Wind Speed')
plt.xlabel('Date')

plt.legend()

plt.show()