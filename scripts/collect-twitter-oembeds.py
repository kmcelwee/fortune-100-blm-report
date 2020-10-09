import requests
import pandas as pd
import json

def get_oembed(tweet_id):
    r = requests.get('https://publish.twitter.com/oembed', 
                     params={'url': f"https://twitter.com/twitter/status/{tweet_id}" })
    return json.loads(r.text)

def collect_twitter_oembeds(HISTOGRAM_JSON_PATH, OEMBED_JSON_PATH, hard=False):
    with open(HISTOGRAM_JSON_PATH) as f:
        histogram_json = json.load(f)

    if not hard:
        with open(OEMBED_JSON_PATH) as f:
            oembed_json = json.load(f)
    else:
        oembed_json = {}

    all_tweet_ids = []
    for comp, comp_dict in histogram_json.items():
        all_tweet_ids.extend([tweet['ID'] for tweet in comp_dict])

    for i, tweet_id in enumerate(all_tweet_ids):
        if i % 100 == 0:
            print(i, end=',')
        if tweet_id not in oembed_json:
            try:
                oembed_json[tweet_id] = get_oembed(tweet_id)
            except:
                if 'error' not in oembed_json:
                    oembed_json['error'] = [tweet_id]
                else:
                    oembed_json['error'].append(tweet_id)

    with open(OEMBED_JSON_PATH, 'w') as f:
        json.dump(oembed_json, f, indent=4)



def main():
    HISTOGRAM_JSON_PATH = 'docs/histogram.json'
    OEMBED_JSON_PATH = 'docs/twitter-oembeds.json'

    collect_twitter_oembeds(HISTOGRAM_JSON_PATH, OEMBED_JSON_PATH)

if __name__ == '__main__':
    main()