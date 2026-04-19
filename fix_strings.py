import os
import re

files = [
    'app/movies/page.tsx', 
    'app/stars/[id]/page.tsx', 
    'app/movies/[id]/page.tsx', 
    'app/checkout/page.tsx', 
    'app/api/movies/route.ts', 
    'app/api/movies/search/route.ts', 
    'app/api/stars/[id]/route.ts'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # We want to replace instances like:
        # \`/api/movies/\${movieId}\` -> `/api/movies/${movieId}`
        # \`Born: \${star.birthYear}\` -> `Born: ${star.birthYear}`
        
        # 1. Fix the backticks that were escaped: \` -> `
        content = content.replace('\\`', '`')
        
        # 2. Fix the dollar signs that were escaped: \${ -> ${
        content = content.replace('\\${', '${')

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print('Fixed:', f)
