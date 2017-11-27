import plotly.plotly as py
import plotly.graph_objs as go

import pandas as pd

df = pd.read_json('aransas_pass.json')

wind_speed = go.Scatter(
    x=df['wind_speed'][0],
    y=df['wind_speed'][1],
    name="Wind Speed",
    line=dict(color='#17BECF'),
    opacity=0.8)

data = [wind_speed]

layout = dict(
    title="Wind Set Date Range",
    xaxis=dict(
        range=['2017-11-20', '2017-11-21'])
)

fig = dict(data=data, layout=layout)
py.iplot(fig, aransas_pass="Manually Set Range")
