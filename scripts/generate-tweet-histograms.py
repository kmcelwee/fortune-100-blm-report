"""
Given the appropriate dataframes, generate a histogram (via scatterplot) that
 shows each corporations tweet patterns from May 25 to July 25. If the tweet
 addressed racial injustice, it is marked black. Otherwise it is grey. Each
 plot is saved as a PNG to the given FIGURE_DIR.
"""

from os.path import join as pjoin
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import date as dt
import matplotlib as mpl
import json
mpl.rcParams['figure.dpi']= 300

import matplotlib.patches as mpatches
import matplotlib.units as munits
import matplotlib.dates as mdates
import datetime

def generate_company_chart(company, handle, sector, FIGURE_DIR, df_t):
    df = df_t[(df_t['Corporation'] == company)].copy()
    df['date'] = df['Datetime'].dt.date

    # a too-complicated way of getting counts for each day
    t = []
    for date in sorted(df['date'].unique()):
        m = df[df['date'] == date]
        t.append([date, list(range(1, m.shape[0]+1))])
    df.sort_values('Datetime', inplace=True)
    new_col = []
    for date, l in t:
        new_col.extend(l)
    df['count'] = new_col

    colormap = ['lightgrey' if x == 0 else 'black' for x in pd.Categorical(df['Racial Justice']).codes]
    max_count = df['count'].max()
    
    ax = df.plot.scatter(
        x='date', y='count', c=colormap, figsize=(10, .15*(max_count+2)),  
        xlim=(dt(2020, 5, 24), dt(2020, 7, 26)), ylim=(0, max_count+2)
    )

    rj_patch = mpatches.Patch(color='k', label='Racial Justice Tweet')
    normal_patch = mpatches.Patch(color='lightgrey', label='Typical Tweet')
    plt.legend(handles=[rj_patch, normal_patch], bbox_to_anchor=(1.3, 1.3))

    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)
    ax.spines['left'].set_visible(False)
    
    if max_count < 10:
        ax.set_yticks([])
    
    ax.set_title(f"Tweets by @{handle} ({company})")
    ax.set_ylabel('')
    ax.set_xlabel('')
    
    plt.savefig(pjoin(FIGURE_DIR, f'{handle}.png'), bbox_inches='tight')
    plt.close()

    output_columns = ['ID', 'Text', 'Racial Justice', 'count', 'date']
    df_o = df[output_columns]
    df_o['date'] = df_o['date'].astype(str)
    df_o['ID'] = df_o['ID'].astype(str)
    tag_cols = ['BLM', 'Juneteenth', 'Money']
    df_o['tags'] = [
        ';'.join([col for col in tag_cols if r[col] and pd.notnull(r[col])]) for i, r in df.iterrows()
    ]

    return {
        'handle': handle,
        'max_count': max_count,
        'sector': sector,
        'tweets': df_o.to_dict('records')
    }

def main():
    DATA_DIR = 'fortune-100-blm-dataset/data'
    FIGURE_DIR = 'figures/tweet-histograms'
    HISTOGRAM_JSON_PATH = 'docs/histogram.json'
    MAPPER_JSON_PATH = 'docs/handle-mapper.json'

    converter = mdates.ConciseDateConverter()
    munits.registry[np.datetime64] = converter
    munits.registry[datetime.date] = converter
    munits.registry[datetime.datetime] = converter

    df_c = pd.read_csv(pjoin(DATA_DIR, 'fortune-100.csv')).dropna()
    df_t = pd.read_csv(pjoin(DATA_DIR, 'fortune-100-tweets.csv'),
        parse_dates=['Datetime'])

    figure_json = {}
    for _, row in df_c.iterrows():
        figure_json[row['Corporation']] = generate_company_chart(
            row['Corporation'], row['Handle'], row['Sector'], FIGURE_DIR, df_t)

    # add mappers
    handle2corp, corp2handle = {}, {}
    for _, row in df_c.iterrows():
        handle2corp[row['Handle']] = row['Corporation']
        corp2handle[row['Corporation']] = row['Handle']
    mapper_json = {
     'handle2corp': handle2corp,
     'corp2handle': corp2handle
    }
    with open(MAPPER_JSON_PATH, 'w') as f:
        json.dump(mapper_json, f, indent=4)  

    figure_json['handle2corp'] = handle2corp
    figure_json['corp2handle'] = corp2handle

    with open(HISTOGRAM_JSON_PATH, 'w') as f:
        json.dump(figure_json, f, indent=4)
        

if __name__ == '__main__':
    main()

