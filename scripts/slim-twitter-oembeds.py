import json

def slim_twitter_oembeds(OEMBED_JSON_PATH, OEMBED_SLIM_JSON_PATH):
    with open(OEMBED_JSON_PATH) as f:
        oembed_json = json.load(f)

    twitter_script = "\n<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>\n"
    oembed_slim = {}
    for tweet_id, tweet in oembed_json.items():
        if tweet_id != 'error':
            tweet_html = tweet.get('html', None)
            oembed_slim[tweet_id] = None if not tweet_html else tweet_html.replace(twitter_script, '')

    for tweet_id in oembed_json['error']:
        oembed_slim[tweet_id] = None

    with open(OEMBED_SLIM_JSON_PATH, 'w') as f:
        json.dump(oembed_slim, f, indent=4)

def main():
    OEMBED_JSON_PATH = 'docs/twitter-oembeds.json'
    OEMBED_SLIM_JSON_PATH = 'docs/twitter-oembeds-slim.json'
    slim_twitter_oembeds(OEMBED_JSON_PATH, OEMBED_SLIM_JSON_PATH)

if __name__ == '__main__':
    main()