import shutil, random, os

abs_path = 'abstract/'
city_path = 'cityscape/'
animal_path = 'animal-painting/'
flower_path = 'flower-painting/'
genre_path = 'genre-painting/'
land_path = 'landscape/'
marina_path = 'marina/'
still_path = 'still-life/'

dest_rep_art = 'repStim/'
dest_abs_art = 'abstrStim/'

abstract = random.sample(os.listdir(abs_path), 70)
cityscapes = random.sample(os.listdir(city_path), 10)
animal_paintings = random.sample(os.listdir(animal_path), 10)
flower_paintings = random.sample(os.listdir(flower_path), 10)
genre_paintings = random.sample(os.listdir(genre_path), 10)
landscapes = random.sample(os.listdir(land_path), 10)
marina = random.sample(os.listdir(marina_path), 10)
still_life = random.sample(os.listdir(still_path), 10)

for fname in abstract:
    srcpath = os.path.join(abs_path, fname)
    shutil.move(srcpath, dest_abs_art)

for fname in cityscapes:
    srcpath = os.path.join(city_path, fname)
    shutil.move(srcpath, dest_rep_art)
    
for fname in animal_paintings:
    srcpath = os.path.join(animal_path, fname)
    shutil.move(srcpath, dest_rep_art)
    
for fname in flower_paintings:
    srcpath = os.path.join(flower_path, fname)
    shutil.move(srcpath, dest_rep_art)
    
for fname in genre_paintings:
    srcpath = os.path.join(genre_path, fname)
    shutil.move(srcpath, dest_rep_art)
    
for fname in landscapes:
    srcpath = os.path.join(land_path, fname)
    shutil.move(srcpath, dest_rep_art)
    
for fname in marina:
    srcpath = os.path.join(marina_path, fname)
    shutil.move(srcpath, dest_rep_art)

for fname in still_life:
    srcpath = os.path.join(still_path, fname)
    shutil.move(srcpath, dest_rep_art)