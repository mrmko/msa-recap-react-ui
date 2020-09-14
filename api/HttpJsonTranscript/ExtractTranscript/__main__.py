# This test requires a sample insights.json file.
# run as
# python3.8 ExtractTranscript/

from __init__ import insights_to_srt

result = []
outf = open("transcript.srt", "wt")
with open('recording.ogg_insights.json', 'r', encoding='utf-8-sig') as f:
    insights_to_srt(f, result)
    outf.writelines(result)
    outf.close()
    print("Done.")
