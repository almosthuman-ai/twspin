import { DifficultyLevel } from '../types';

export const DEFAULT_EFL_PUZZLE_SEED_VERSION = 20260115;

export interface DefaultEflPuzzle {
  id: string;
  category: string;
  phrase: string;
  createdAt: number;
  difficulty: DifficultyLevel;
  seedVersion: number;
}

export type DefaultEflPuzzleCatalog = Record<DifficultyLevel, Record<string, DefaultEflPuzzle[]>>;

const BASE_TIMESTAMP = 1700000000000;

const DIFFICULTY_SLUG: Record<DifficultyLevel, string> = {
  [DifficultyLevel.A1]: 'a1',
  [DifficultyLevel.A2]: 'a2',
  [DifficultyLevel.B1]: 'b1',
  [DifficultyLevel.B2]: 'b2',
};

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const buildPuzzle = (
  difficulty: DifficultyLevel,
  category: string,
  index: number,
  phrase: string
): DefaultEflPuzzle => ({
  id: `${DIFFICULTY_SLUG[difficulty]}_${slugify(category)}_${index.toString().padStart(2, '0')}`,
  category,
  phrase,
  difficulty,
  createdAt: BASE_TIMESTAMP + index,
  seedVersion: DEFAULT_EFL_PUZZLE_SEED_VERSION,
});

const A1_DAILY_LIFE = [
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 1, 'I WAKE UP AT SIX THIRTY'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 2, 'I BRUSH MY TEETH AFTER BREAKFAST'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 3, 'I WALK TO SCHOOL EVERY MORNING'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 4, 'I EAT DINNER WITH MY FAMILY'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 5, 'I WRITE MY HOMEWORK EACH NIGHT'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 6, 'I CLEAN MY ROOM ON SUNDAYS'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 7, 'I DRINK WATER WHEN I AM THIRSTY'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 8, 'I PUT ON MY SHOES BEFORE CLASS'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 9, 'I CALL MY FRIEND EVERY EVENING'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 10, 'I FEED MY CAT BEFORE SCHOOL'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 11, 'I READ A BOOK BEFORE BED'),
  buildPuzzle(DifficultyLevel.A1, 'DAILY LIFE', 12, 'I PRACTICE ENGLISH WITH MY SISTER'),
];

const A1_FOOD_DRINK = [
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 1, 'I LIKE TO DRINK HOT TEA'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 2, 'I EAT FRIED RICE FOR LUNCH'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 3, 'I ORDER NOODLE SOUP AT DINNER'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 4, 'I SHARE APPLES WITH MY CLASSMATES'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 5, 'I PACK A SANDWICH FOR SCHOOL'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 6, 'I DRINK MILK BEFORE I SLEEP'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 7, 'I BUY FRESH BREAD FROM THE MARKET'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 8, 'I TASTE NEW FRUIT AT THE STORE'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 9, 'I COOK RICE WITH MY GRANDMA'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 10, 'I LIKE SWEET TOFU FOR DESSERT'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 11, 'I POUR JUICE INTO THE CUPS'),
  buildPuzzle(DifficultyLevel.A1, 'FOOD & DRINK', 12, 'I EAT STEAMED DUMPLINGS ON TUESDAY'),
];

const A1_SCHOOL = [
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 1, 'I SIT IN CLASS WITH MY FRIENDS'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 2, 'I LISTEN TO THE TEACHER CAREFULLY'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 3, 'I WRITE NOTES IN MY BLUE NOTEBOOK'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 4, 'I ANSWER EASY QUESTIONS DURING ENGLISH'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 5, 'I LINE UP QUIETLY AFTER THE BELL'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 6, 'I STUDY SPELLING WORDS WITH A PARTNER'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 7, 'I PLAY BASKETBALL WITH MY CLASSMATES'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 8, 'I OPEN MY LOCKER BEFORE FIRST CLASS'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 9, 'I RAISE MY HAND TO SPEAK'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 10, 'I READ SHORT STORIES IN THE LIBRARY'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 11, 'I PRACTICE SPELLING WITH FLASH CARDS'),
  buildPuzzle(DifficultyLevel.A1, 'SCHOOL', 12, 'I FINISH MY MATH PAGE BEFORE LUNCH'),
];

const A1_ANIMALS = [
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 1, 'I FEED THE DOG IN THE MORNING'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 2, 'I PET THE CAT AFTER SCHOOL'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 3, 'I WATCH THE BIRDS SING EVERY DAY'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 4, 'I HEAR FROGS CROAK NEAR THE POND'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 5, 'I SEE FISH SWIM IN THE TANK'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 6, 'I HELP WASH THE HOUSE RABBIT'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 7, 'I BRUSH THE PONY DURING FARM VISITS'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 8, 'I NAME THE TURTLES WITH MY BROTHER'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 9, 'I DRAW BIG ELEPHANTS IN ART CLASS'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 10, 'I COUNT SHEEP WHEN I CANNOT SLEEP'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 11, 'I FOLLOW THE DUCKS BY THE RIVER'),
  buildPuzzle(DifficultyLevel.A1, 'ANIMALS', 12, 'I CARE FOR THE CLASS HAMSTER'),
];

const A1_MOVIES = [
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 1, 'I WATCH CARTOONS WITH MY LITTLE BROTHER'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 2, 'I BUY POPCORN BEFORE THE MOVIE STARTS'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 3, 'I SIT CLOSE TO MY BEST FRIEND'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 4, 'I WEAR A JACKET INSIDE THE CINEMA'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 5, 'I LIKE FUNNY MOVIES WITH HAPPY ENDINGS'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 6, 'I LISTEN TO THE LOUD MOVIE SONGS'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 7, 'I SHARE MY SODA WITH MY COUSIN'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 8, 'I CLAP WHEN THE HERO SAVES EVERYONE'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 9, 'I READ THE SUBTITLES VERY CAREFULLY'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 10, 'I REMEMBER LINES FROM MY FAVORITE MOVIE'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 11, 'I CHOOSE A SEAT IN THE MIDDLE'),
  buildPuzzle(DifficultyLevel.A1, 'MOVIES', 12, 'I SMILE WHEN THE MOVIE HAS DANCING'),
];

const A1_FAMILY = [
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 1, 'I LIVE WITH MY PARENTS AND SISTER'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 2, 'I HELP MY MOTHER COOK RICE'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 3, 'I CALL MY GRANDMA EVERY SUNDAY NIGHT'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 4, 'I PLAY CARDS WITH MY UNCLE'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 5, 'I TAKE PHOTOS WITH MY FAMILY'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 6, 'I WALK IN THE PARK WITH DAD'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 7, 'I TELL STORIES TO MY LITTLE COUSIN'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 8, 'I SHARE A ROOM WITH MY BROTHER'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 9, 'I HUG MY FAMILY BEFORE BEDTIME'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 10, 'I WRITE LETTERS TO MY AUNT'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 11, 'I CELEBRATE BIRTHDAYS WITH A BIG CAKE'),
  buildPuzzle(DifficultyLevel.A1, 'FAMILY', 12, 'I SAY GOOD MORNING TO EVERYONE'),
];

const A1_TRAVEL = [
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 1, 'I RIDE THE BUS TO THE CITY'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 2, 'I PACK MY BAG WITH CLEAN CLOTHES'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 3, 'I SHOW MY TICKET TO THE DRIVER'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 4, 'I WAIT IN LINE AT THE STATION'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 5, 'I CHECK THE MAP BEFORE WE LEAVE'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 6, 'I TAKE PHOTOS DURING EVERY TRIP'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 7, 'I LISTEN TO MUSIC ON THE TRAIN'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 8, 'I CARRY A SNACK FOR THE JOURNEY'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 9, 'I LEAVE HOME EARLY FOR THE AIRPORT'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 10, 'I BUY A SOUVENIR FOR MY FRIEND'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 11, 'I STAY WITH MY COUSINS IN TAINAN'),
  buildPuzzle(DifficultyLevel.A1, 'TRAVEL', 12, 'I ENJOY THE VIEW FROM THE PLANE'),
];

const A1_HOBBIES = [
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 1, 'I DRAW FLOWERS WITH COLORED PENCILS'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 2, 'I PLAY MUSIC ON MY SMALL KEYBOARD'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 3, 'I RIDE MY BIKE AFTER DINNER'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 4, 'I BUILD MODELS WITH MY FRIEND'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 5, 'I PRACTICE YOGA IN THE LIVING ROOM'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 6, 'I SING SONGS WITH MY CHOIR GROUP'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 7, 'I COLLECT STAMPS FROM DIFFERENT COUNTRIES'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 8, 'I PLANT FLOWERS ON THE BALCONY'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 9, 'I PRACTICE TAI CHI WITH MY GRANDPA'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 10, 'I SOLVE EASY PUZZLES BEFORE BEDTIME'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 11, 'I WATCH BIRDS WITH A SMALL TELESCOPE'),
  buildPuzzle(DifficultyLevel.A1, 'HOBBIES', 12, 'I KNIT SCARVES WITH MY MOTHER'),
];

const A1_PHRASE = [
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 1, 'PLEASE CLOSE THE DOOR BEHIND YOU'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 2, 'THANK YOU FOR HELPING ME TODAY'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 3, 'PLEASE SPEAK SLOWLY SO I UNDERSTAND'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 4, 'COULD YOU WRITE THAT WORD AGAIN'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 5, 'I AM HAPPY TO MEET YOU'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 6, 'PLEASE PASS ME THE SALT'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 7, 'I DO NOT UNDERSTAND THIS SENTENCE'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 8, 'WHAT DOES THIS NEW WORD MEAN'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 9, 'PLEASE TURN ON THE LIGHTS'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 10, 'LET US PRACTICE ENGLISH TOGETHER'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 11, 'IT IS NICE TO SEE YOU'),
  buildPuzzle(DifficultyLevel.A1, 'PHRASE', 12, 'CAN YOU HELP ME WITH HOMEWORK'),
];

const A1_QUESTION = [
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 1, 'WHAT TIME DOES THE BUS ARRIVE'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 2, 'WHO IS SITTING NEXT TO YOU'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 3, 'WHERE IS THE ENGLISH CLASSROOM'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 4, 'WHY IS THE TEACHER RUNNING LATE'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 5, 'HOW MANY APPLES DO YOU WANT'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 6, 'WHAT IS YOUR FAVORITE SCHOOL LUNCH'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 7, 'WHO WILL BRING THE BOARD GAME'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 8, 'HOW MUCH MILK IS IN THERE'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 9, 'WHEN DOES THE MOVIE START TODAY'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 10, 'WHERE ARE WE MEETING AFTER SCHOOL'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 11, 'WHO CAN HELP CLEAN THE TABLES'),
  buildPuzzle(DifficultyLevel.A1, 'QUESTION', 12, 'WHAT BUS GOES TO THE SPORTS CENTER'),
];

const A1_THING = [
  buildPuzzle(DifficultyLevel.A1, 'THING', 1, 'THE BLUE BACKPACK IS VERY LIGHT'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 2, 'THIS RED PENCIL WRITES VERY SMOOTHLY'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 3, 'THE ROUND CLOCK HANGS ABOVE US'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 4, 'THE SMALL RADIO PLAYS MORNING NEWS'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 5, 'THE GREEN CUP HOLDS HOT TEA'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 6, 'THE WHITE BOARD IS VERY CLEAN'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 7, 'THE NEW TABLE HAS FOUR CHAIRS'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 8, 'THE BLACK UMBRELLA IS UNDER THERE'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 9, 'THE PINK ERASER FIXES MANY MISTAKES'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 10, 'THE SILVER SPOON SHINES EVERY MORNING'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 11, 'THE YELLOW LAMP GIVES SOFT LIGHT'),
  buildPuzzle(DifficultyLevel.A1, 'THING', 12, 'THE SMALL FAN KEEPS US COOL'),
];

const A1_PLACE = [
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 1, 'THE PARK IS QUIET AFTER SUNSET'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 2, 'THE LIBRARY SMELLS LIKE OLD BOOKS'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 3, 'THE MARKET IS BUSY ON SATURDAY'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 4, 'THE CLASSROOM FEELS WARM IN WINTER'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 5, 'THE PLAYGROUND HAS A TALL SLIDE'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 6, 'THE MUSEUM IS NEAR OUR SCHOOL'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 7, 'THE RIVER BANK IS WINDY TODAY'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 8, 'THE BUS STOP IS UNDER THAT TREE'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 9, 'THE TEMPLE IS FULL DURING FESTIVALS'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 10, 'THE BEACH IS QUIET AT DAWN'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 11, 'THE CAFE IS SMALL BUT FRIENDLY'),
  buildPuzzle(DifficultyLevel.A1, 'PLACE', 12, 'THE STATION IS CLEAN AND BRIGHT'),
];

const A2_DAILY_LIFE = [
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 1, 'I USUALLY JOG BEFORE THE SUNRISE'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 2, 'I AM PRACTICING TAI CHI WITH NEIGHBORS'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 3, 'I PREPARE MY UNIFORM THE NIGHT BEFORE'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 4, 'I WATER THE PLANTS EVERY OTHER DAY'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 5, 'I KEEP A JOURNAL ABOUT MY ROUTINE'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 6, 'I ORGANIZE THE CLOSET ON SATURDAY MORNINGS'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 7, 'I AM PRACTICING NEW SONGS AFTER DINNER'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 8, 'I CHECK MESSAGES WHILE EATING BREAKFAST'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 9, 'I STRETCH MY BACK WHEN IT FEELS SORE'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 10, 'I HELP MY SISTER PLAN HER DAY'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 11, 'I REVIEW THE NEXT DAY PLAN BEFORE BED'),
  buildPuzzle(DifficultyLevel.A2, 'DAILY LIFE', 12, 'I AM LEARNING TO COOK SIMPLE LUNCHES'),
];

const A2_FOOD_DRINK = [
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 1, 'I EXPERIMENT WITH NEW SPICES ON WEEKENDS'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 2, 'I AM MARINATING TOFU FOR THE BARBECUE'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 3, 'I PACK HEALTHY SNACKS FOR THE TRIP'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 4, 'I COMPARE PRICES BEFORE BUYING FRESH VEGETABLES'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 5, 'I PREPARE ICED TEA WITH LEMON SLICES'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 6, 'I READ RECIPES TO IMPROVE MY COOKING'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 7, 'I AM BAKING BREAD FOR OUR FAMILY'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 8, 'I ORDER EXTRA VEGETABLES WITH MY NOODLES'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 9, 'I LEARN TO BALANCE SWEET AND SOUR'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 10, 'I SERVE DESSERT WITH FRESH STRAWBERRIES'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 11, 'I BREW HERBAL TEA FOR MY PARENTS'),
  buildPuzzle(DifficultyLevel.A2, 'FOOD & DRINK', 12, 'I STORE LEFTOVERS IN SMALL GLASS BOXES'),
];

const A2_SCHOOL = [
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 1, 'I PRESENT REPORTS USING CLEAR SPEAKING NOTES'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 2, 'I EDIT MY ESSAYS BEFORE SUBMISSION DAY'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 3, 'I STUDY GEOGRAPHY WITH INTERACTIVE MAPS'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 4, 'I PRACTICE GRAMMAR WITH ONLINE QUIZZES'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 5, 'I LEAD GROUP DISCUSSIONS ABOUT SHORT STORIES'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 6, 'I AM BUILDING A SCIENCE FAIR MODEL'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 7, 'I CHECK RUBRICS TO UNDERSTAND EXPECTATIONS'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 8, 'I REVIEW CLASSMATES FEEDBACK AFTER PRESENTATIONS'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 9, 'I PRACTICE DIALOGUES WITH PRONUNCIATION APPS'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 10, 'I SOLVE WORD PROBLEMS USING DRAWN DIAGRAMS'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 11, 'I ORGANIZE STUDY NOTES BY SUBJECT COLOR'),
  buildPuzzle(DifficultyLevel.A2, 'SCHOOL', 12, 'I SCHEDULE TUTORING SESSIONS FOR DIFFICULT TOPICS'),
];

const A2_ANIMALS = [
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 1, 'I OBSERVE BUTTERFLY PATTERNS IN THE GARDEN'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 2, 'I RECORD BIRD SONGS WITH MY PHONE'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 3, 'I SKETCH TURTLES RESTING BESIDE THE POND'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 4, 'I RESCUE STRAY KITTENS WITH THE SHELTER'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 5, 'I IDENTIFY FISH SPECIES DURING SNORKEL TRIPS'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 6, 'I DOCUMENT INSECT HABITS FOR CLASS PROJECTS'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 7, 'I TRAIN MY DOG USING HAND SIGNALS'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 8, 'I COMPARE REPTILE SCALES UNDER A MICROSCOPE'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 9, 'I HIKE TO OBSERVE MONKEYS NEAR TEMPLES'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 10, 'I VOLUNTEER WEEKENDS AT A WILDLIFE CENTER'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 11, 'I NOTE NOCTURNAL SOUNDS IN A JOURNAL'),
  buildPuzzle(DifficultyLevel.A2, 'ANIMALS', 12, 'I DISCUSS ENDANGERED SPECIES WITH MY CLASS'),
];

const A2_MOVIES = [
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 1, 'I ANALYZE SCENE TRANSITIONS FOR FILM CLUB'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 2, 'I RECOMMEND FAMILY MOVIES DURING HOMEROOM'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 3, 'I STUDY SUBTITLES TO LEARN NEW EXPRESSIONS'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 4, 'I COMPARE ORIGINAL SOUNDTRACKS WITH REMAKES'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 5, 'I DISCUSS CHARACTER MOTIVES AFTER SCREENINGS'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 6, 'I CREATE QUIZZES ABOUT MOVIE DETAILS'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 7, 'I MEMORIZE QUOTES FOR DRAMA PRACTICE'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 8, 'I STUDY CAMERA ANGLES USING ONLINE CLIPS'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 9, 'I PREPARE REVIEWS BEFORE SHARING RECOMMENDATIONS'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 10, 'I ATTEND FILM FESTIVALS WITH CLASSMATES'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 11, 'I COMPARE DUBBED AND SUBTITLED VERSIONS'),
  buildPuzzle(DifficultyLevel.A2, 'MOVIES', 12, 'I PRACTICE ACTING SHORT SCRIPTS AFTER VIEWING'),
];

const A2_FAMILY = [
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 1, 'I INTERVIEW MY GRANDPARENTS ABOUT FAMILY HISTORY'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 2, 'I ORGANIZE WEEKLY GAME NIGHTS FOR RELATIVES'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 3, 'I MANAGE THE CHORES LIST WITH MY BROTHER'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 4, 'I LEARN OLD RECIPES FROM MY AUNT'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 5, 'I TRANSLATE LETTERS FOR MY GRANDPARENTS'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 6, 'I PLAN FAMILY PICNICS DURING LONG WEEKENDS'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 7, 'I SCHEDULE VIDEO CALLS WITH COUSINS OVERSEAS'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 8, 'I RECORD CHILDHOOD STORIES FOR OUR ALBUM'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 9, 'I SHARE RESPONSIBILITIES WHEN RELATIVES VISIT'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 10, 'I SUPPORT MY SISTER DURING EXAMS'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 11, 'I PRACTICE SONGS FOR FAMILY CELEBRATIONS'),
  buildPuzzle(DifficultyLevel.A2, 'FAMILY', 12, 'I WRITE THANK YOU NOTES AFTER GATHERINGS'),
];

const A2_TRAVEL = [
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 1, 'I COMPARE TRAIN SCHEDULES BEFORE BOOKING TICKETS'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 2, 'I NEGOTIATE RATES WITH LOCAL HOMESTAY HOSTS'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 3, 'I RESEARCH CULTURAL ETIQUETTE FOR EACH DESTINATION'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 4, 'I PREPARE SIMPLE PHRASES FOR ASKING DIRECTIONS'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 5, 'I PACK MEDICINE AND EMERGENCY CONTACT CARDS'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 6, 'I DOCUMENT TRAVEL BUDGETS IN A NOTEBOOK'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 7, 'I CHOOSE ECO FRIENDLY OPTIONS WHEN POSSIBLE'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 8, 'I PRACTICE ASKING FOR HELP IN ENGLISH'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 9, 'I SEND DAILY UPDATES TO MY PARENTS'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 10, 'I READ REVIEWS BEFORE RESERVING HOSTELS'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 11, 'I STUDY METRO MAPS TO AVOID GETTING LOST'),
  buildPuzzle(DifficultyLevel.A2, 'TRAVEL', 12, 'I PRACTICE ORDERING FOOD IN FOREIGN CITIES'),
];

const A2_HOBBIES = [
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 1, 'I ATTEND WEEKLY POTTERY LESSONS WITH FRIENDS'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 2, 'I MAINTAIN A BLOG ABOUT URBAN GARDENING'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 3, 'I PRACTICE CALLIGRAPHY TO IMPROVE HANDWRITING'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 4, 'I LEARN CHORDS FOR POPULAR FOLK SONGS'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 5, 'I RECORD DANCE ROUTINES FOR ONLINE CHALLENGES'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 6, 'I COMPETE IN FRIENDLY ESPORTS EVERY FRIDAY'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 7, 'I BUILD ROBOT KITS WITH MY NEIGHBOR'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 8, 'I JOIN PHOTO WALKS TO PRACTICE FRAMING'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 9, 'I VOLUNTEER TO TEACH CHILDREN BASIC CHESS'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 10, 'I STUDY MAGIC TRICKS FOR SMALL SHOWS'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 11, 'I WRITE SHORT POEMS ABOUT DAILY FEELINGS'),
  buildPuzzle(DifficultyLevel.A2, 'HOBBIES', 12, 'I PRACTICE PHOTOGRAPHY DURING SUNSET RIDES'),
];

const A2_PHRASE = [
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 1, 'PLEASE REMIND ME ABOUT TOMORROW DEADLINE'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 2, 'THANK YOU FOR BEING PATIENT WITH ME'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 3, 'I APPRECIATE YOUR CLEAR AND HONEST FEEDBACK'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 4, 'COULD YOU EXPLAIN THAT IDEA MORE DEEPLY'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 5, 'PLEASE CORRECT ME IF I MISPRONOUNCE'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 6, 'I WOULD LIKE EXTRA TIME FOR PRACTICE'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 7, 'LET US REVIEW THE MAIN POINTS AGAIN'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 8, 'PLEASE EMPHASIZE THE KEY WORDS SLOWLY'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 9, 'I UNDERSTAND BETTER WHEN YOU USE EXAMPLES'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 10, 'PLEASE WRITE THE PHRASE ON THE BOARD'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 11, 'I WILL SHARE MY NOTES WITH EVERYONE'),
  buildPuzzle(DifficultyLevel.A2, 'PHRASE', 12, 'THANK YOU FOR ORGANIZING THIS WORKSHOP'),
];

const A2_QUESTION = [
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 1, 'WHAT MAKES THIS TRADITION DIFFERENT FROM OTHERS'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 2, 'HOW CAN WE IMPROVE OUR GROUP COOPERATION'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 3, 'WHERE SHOULD WE STORE THE EXTRA MATERIALS'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 4, 'WHEN WILL THE TEACHER POST THE GRADES'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 5, 'WHO CAN GUIDE US THROUGH THIS PROCEDURE'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 6, 'WHY DID THE MEETING START WITHOUT NOTICE'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 7, 'WHAT SHOULD WE PREPARE FOR FINAL PRESENTATIONS'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 8, 'HOW DOES THIS EXPERIMENT SUPPORT THE HYPOTHESIS'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 9, 'WHICH OPTION GIVES US MORE FLEXIBILITY'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 10, 'WHEN ARE WE VISITING THE SCIENCE MUSEUM'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 11, 'WHO IS RESPONSIBLE FOR SHARING THE RESULTS'),
  buildPuzzle(DifficultyLevel.A2, 'QUESTION', 12, 'WHAT RESOURCES DO WE NEED THIS WEEKEND'),
];

const A2_THING = [
  buildPuzzle(DifficultyLevel.A2, 'THING', 1, 'THE PORTABLE SPEAKER CONNECTS TO MY TABLET'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 2, 'THE CERAMIC BOWL HOLDS HOMEMADE PICKLES'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 3, 'THE BAMBOO FAN COOLS THE ENTIRE ROOM'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 4, 'THE DIGITAL WATCH TRACKS MY DAILY STEPS'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 5, 'THE LIGHTWEIGHT SUITCASE FITS IN THE OVERHEAD'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 6, 'THE MAGNETIC BOARD DISPLAYS IMPORTANT REMINDERS'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 7, 'THE DRAWSTRING BAG CARRIES EXTRA SHOES'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 8, 'THE RECHARGEABLE LAMP LASTS THROUGH BLACKOUTS'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 9, 'THE COLORFUL SCARF BRIGHTENS MY WINTER COAT'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 10, 'THE MULTI PURPOSE TOOL INCLUDES A SCREWDRIVER'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 11, 'THE COMPACT THERMOS KEEPS SOUP WARM'),
  buildPuzzle(DifficultyLevel.A2, 'THING', 12, 'THE FOLDING CHAIR SUPPORTS MY BACK NICELY'),
];

const A2_PLACE = [
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 1, 'THE MOUNTAIN TRAIL OFFERS PEACEFUL MORNING VIEWS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 2, 'THE CITY PLAZA HOSTS WEEKLY ART FAIRS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 3, 'THE CAMPUS CAFE SERVES LOCALLY ROASTED BEANS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 4, 'THE COMMUNITY CENTER PROVIDES FREE LANGUAGE LESSONS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 5, 'THE OLD LIGHTHOUSE OVERLOOKS A QUIET HARBOR'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 6, 'THE SEASIDE HOSTEL OFFERS SHARED KITCHENS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 7, 'THE FOREST CABIN STAYS COOL DURING SUMMER'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 8, 'THE RIVERSIDE MARKET FEATURES HANDMADE CRAFTS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 9, 'THE EXHIBIT HALL HIGHLIGHTS LOCAL INVENTIONS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 10, 'THE QUIET MONASTERY WELCOMES RESPECTFUL VISITORS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 11, 'THE BUSY CROSSWALK CONNECTS TWO SHOPPING STREETS'),
  buildPuzzle(DifficultyLevel.A2, 'PLACE', 12, 'THE SPORT CENTER OPENS EARLY FOR TRAINING'),
];

const B1_DAILY_LIFE = [
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 1, 'I WAKE BEFORE DAWN TO MEDITATE AND STRETCH'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 2, 'I BALANCE MY SCHEDULE BY PRIORITIZING MORNING TASKS'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 3, 'I PREPARE MEALS IN ADVANCE TO AVOID RUSH'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 4, 'I REFLECT EACH EVENING ON PROGRESS AND HABITS'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 5, 'I TRACK MY WATER INTAKE USING A TIMER'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 6, 'I PRACTICE MINDFUL BREATHING WHEN COMMUTES FEEL STRESSFUL'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 7, 'I COORDINATE FAMILY DUTIES THROUGH A SHARED CALENDAR'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 8, 'I SET DAILY INTENTIONS BEFORE CHECKING MY PHONE'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 9, 'I ALLOCATE QUIET TIME FOR READING AFTER DINNER'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 10, 'I JOURNAL GRATITUDE NOTES TO IMPROVE MY OUTLOOK'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 11, 'I REVIEW TOMORROW OBJECTIVES DURING EVENING WALK'),
  buildPuzzle(DifficultyLevel.B1, 'DAILY LIFE', 12, 'I RESET MY DESK NIGHTLY TO MAINTAIN FOCUS'),
];

const B1_FOOD_DRINK = [
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 1, 'I DEVELOP BALANCED MENUS THAT REDUCE FOOD WASTE'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 2, 'I EXPERIMENT WITH FERMENTED VEGETABLES FOR PROBIOTICS'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 3, 'I EVALUATE STREET FOODS FOR CLEAN PREPARATION PRACTICES'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 4, 'I SUBSTITUTE SUGAR WITH LOCAL HONEY WHEN BAKING'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 5, 'I TEACH MY BROTHER HOW TO STEAM DUMPLINGS'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 6, 'I HOST POTLUCK DINNERS TO SHARE REGIONAL SPECIALTIES'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 7, 'I CATALOGUE FAVORITE RECIPES WITH NUTRITION NOTES'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 8, 'I LEARN COFFEE BREWING METHODS FROM TRAVEL VIDEOS'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 9, 'I PREPARE BENTO BOXES THAT BALANCE COLORS'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 10, 'I REVIEW FOOD LABELS TO LIMIT ADDITIVES'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 11, 'I DOCUMENT GRANDMOTHER STORIES ABOUT FESTIVAL DISHES'),
  buildPuzzle(DifficultyLevel.B1, 'FOOD & DRINK', 12, 'I COMPARE HERBAL TEAS FOR CALMING PROPERTIES'),
];

const B1_SCHOOL = [
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 1, 'I DEVELOP PROJECT TIMELINES TO MANAGE TEAM DELIVERABLES'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 2, 'I SYNTHESIZE RESEARCH ARTICLES INTO CLEAR SUMMARIES'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 3, 'I FACILITATE PEER FEEDBACK SESSIONS WITH RUBRICS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 4, 'I CURATE STUDY GUIDES THAT HIGHLIGHT CORE CONCEPTS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 5, 'I PRACTICE DEBATE SKILLS BY ANALYZING CASE STUDIES'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 6, 'I REVIEW LAB PROCEDURES TO PREVENT SAFETY INCIDENTS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 7, 'I DESIGN POSTERS USING GRAPHIC ORGANIZER TOOLS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 8, 'I INTERVIEW ALUMNI TO UNDERSTAND CAREER PATHWAYS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 9, 'I AUDIT MY NOTES TO IDENTIFY KNOWLEDGE GAPS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 10, 'I COACH CLASSMATES STRUGGLING WITH COMPLEX FORMULAS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 11, 'I MANAGE CLUB FINANCES WITH ACCURATE LEDGERS'),
  buildPuzzle(DifficultyLevel.B1, 'SCHOOL', 12, 'I PREPARE REFLECTION REPORTS AFTER EVERY SEMINAR'),
];

const B1_ANIMALS = [
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 1, 'I MONITOR STRAY CAT HEALTH USING COMMUNITY DATA'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 2, 'I TRAIN RESCUE DOGS THROUGH POSITIVE REINFORCEMENT'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 3, 'I EVALUATE WILDLIFE HABITATS AFFECTED BY CONSTRUCTION'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 4, 'I STUDY MIGRATION PATTERNS USING SATELLITE MAPS'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 5, 'I ORGANIZE BEACH CLEANUPS TO PROTECT SEA TURTLES'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 6, 'I COLLECT DATA ON FIREFLY POPULATION CHANGES'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 7, 'I FILM DOCUMENTARIES ABOUT RESPONSIBLE PET CARE'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 8, 'I VOLUNTEER AT SANCTUARIES DURING FEEDING HOURS'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 9, 'I REHABILITATE INJURED BIRDS WITH LICENSED EXPERTS'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 10, 'I DEBATE ETHICAL ZOO POLICIES WITH CLASSMATES'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 11, 'I MAP CORAL HEALTH TO SUPPORT MARINE PROJECTS'),
  buildPuzzle(DifficultyLevel.B1, 'ANIMALS', 12, 'I RESEARCH TRADITIONAL STORIES ABOUT SACRED ANIMALS'),
];

const B1_MOVIES = [
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 1, 'I CRITIQUE CINEMATOGRAPHY TO IMPROVE MY STORYBOARDING'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 2, 'I HOST DISCUSSIONS ON REPRESENTATION IN FILM'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 3, 'I COMPARE DOCUMENTARIES TO IDENTIFY BIAS STRATEGIES'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 4, 'I TRANSLATE MOVIE SCRIPTS TO PRACTICE NUANCED DIALOGUE'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 5, 'I ANALYZE CHARACTER ARCS USING STORY MAPPING'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 6, 'I COMPARE FILM ADAPTATIONS WITH ORIGINAL NOVELS'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 7, 'I EDIT SHORT FILMS TO TEST COLOR GRADING'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 8, 'I RESEARCH DIRECTORS WHO INSPIRE MODERN CINEMA'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 9, 'I ORGANIZE COMMUNITY SCREENINGS WITH DISCUSSION GUIDES'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 10, 'I STUDY SOUND DESIGN TO ENHANCE ATMOSPHERE'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 11, 'I PRACTICE SUBTITLING TO IMPROVE TRANSLATION SPEED'),
  buildPuzzle(DifficultyLevel.B1, 'MOVIES', 12, 'I WRITE REVIEWS THAT ADDRESS CULTURAL CONTEXTS'),
];

const B1_FAMILY = [
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 1, 'I NEGOTIATE WEEKLY RESPONSIBILITIES DURING FAMILY MEETINGS'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 2, 'I ADVISE MY COUSINS ABOUT UNIVERSITY APPLICATIONS'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 3, 'I COORDINATE CARE SCHEDULES FOR MY GRANDPARENTS'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 4, 'I DOCUMENT FAMILY ORAL HISTORIES WITH AUDIO RECORDERS'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 5, 'I SUPPORT MY SISTER THROUGH EXAM STRESS'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 6, 'I PLAN ROTATING MENUS FOR SHARED DINNERS'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 7, 'I MENTOR MY NEPHEW ON STUDY STRATEGIES'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 8, 'I PREPARE SLIDESHOWS FOR FAMILY REUNION EVENTS'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 9, 'I MEDIATE ARGUMENTS BY ENCOURAGING ACTIVE LISTENING'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 10, 'I TEACH GRANDPA HOW TO USE MESSENGER'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 11, 'I SAVE MONTHLY FUNDS FOR EMERGENCY SUPPORT'),
  buildPuzzle(DifficultyLevel.B1, 'FAMILY', 12, 'I CRAFT PERSONAL GIFTS TO STRENGTHEN CONNECTIONS'),
];

const B1_TRAVEL = [
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 1, 'I NEGOTIATE GROUP DISCOUNTS FOR TRAIN EXCURSIONS'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 2, 'I CREATE ITINERARIES THAT BALANCE CULTURE AND REST'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 3, 'I RESEARCH VISA POLICIES BEFORE INTERNATIONAL TRIPS'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 4, 'I TRACK EXPENSES USING A SHARED SPREADSHEET'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 5, 'I CONFIRM RESERVATIONS TO AVOID LAST MINUTE ISSUES'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 6, 'I STUDY REGIONAL HISTORY TO ENHANCE TRAVEL EXPERIENCES'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 7, 'I PACK MULTIPURPOSE CLOTHING TO SAVE LUGGAGE SPACE'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 8, 'I PRACTICE NAVIGATING WITH OFFLINE MAP APPLICATIONS'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 9, 'I INTERVIEW LOCALS TO DISCOVER HIDDEN CAFES'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 10, 'I SCHEDULE RECOVERY DAYS AFTER LONG JOURNEYS'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 11, 'I WRITE TRAVEL ESSAYS TO CAPTURE CULTURAL DETAILS'),
  buildPuzzle(DifficultyLevel.B1, 'TRAVEL', 12, 'I SHARE SAFETY UPDATES WITH MY TRAVEL COMPANIONS'),
];

const B1_HOBBIES = [
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 1, 'I PRODUCE PODCAST EPISODES ABOUT URBAN LEGENDS'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 2, 'I ARRANGE HARMONIES FOR OUR COMMUNITY CHOIR'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 3, 'I RESTORE VINTAGE BIKES WITH RECYCLED PARTS'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 4, 'I DESIGN BOARD GAMES THAT TEACH LOCAL HISTORY'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 5, 'I CURATE PHOTO ESSAYS FOR A DIGITAL ZINE'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 6, 'I CHOREOGRAPH DANCE ROUTINES FOR SCHOOL EVENTS'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 7, 'I LEARN PROGRAMMING PATTERNS BY BUILDING SMALL APPS'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 8, 'I ORGANIZE WEEKLY WRITING SALONS WITH CLASSMATES'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 9, 'I CREATE CERAMIC GLAZES USING NATURAL PIGMENTS'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 10, 'I MASTER CARD TRICKS TO ENTERTAIN CHILDREN'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 11, 'I REVIEW TECHNIQUE VIDEOS TO IMPROVE BRUSH STROKES'),
  buildPuzzle(DifficultyLevel.B1, 'HOBBIES', 12, 'I COMPOSE SHORT SCORES FOR INDIE FILMS'),
];

const B1_PHRASE = [
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 1, 'THANK YOU FOR ADDRESSING MY CONCERNS SO QUICKLY'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 2, 'PLEASE LET ME KNOW YOUR HONEST OPINION'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 3, 'I APPRECIATE HOW THOROUGHLY YOU CLARIFIED THAT'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 4, 'COULD WE RESCHEDULE SO EVERYONE PARTICIPATES FULLY'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 5, 'PLEASE PROVIDE CONTEXT BEFORE INTRODUCING NEW CONCEPTS'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 6, 'I WOULD VALUE ANY RESOURCES YOU RECOMMEND'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 7, 'LET ME CONFIRM I UNDERSTOOD YOUR MAIN POINT'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 8, 'THANK YOU FOR BEING FLEXIBLE WITH SCHEDULES'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 9, 'PLEASE EMAIL THE SUMMARY BEFORE TOMORROW MORNING'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 10, 'I RESPECT HOW PATIENTLY YOU EXPLAINED EVERYTHING'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 11, 'COULD YOU HIGHLIGHT THE PRIORITY TASKS AGAIN'),
  buildPuzzle(DifficultyLevel.B1, 'PHRASE', 12, 'PLEASE VERIFY THE NUMBERS BEFORE WE PRESENT'),
];

const B1_QUESTION = [
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 1, 'WHAT STRATEGIES HELP YOU BALANCE MULTIPLE DEADLINES'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 2, 'HOW CAN WE MEASURE SUCCESS AFTER IMPLEMENTATION'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 3, 'WHICH FACTORS SHOULD WE PRIORITIZE DURING PLANNING'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 4, 'WHEN WILL THE COMMITTEE RELEASE UPDATED GUIDELINES'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 5, 'WHO CAN LEAD TRAINING IF THE INSTRUCTOR RESIGNS'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 6, 'WHY DID THE SURVEY RESULTS CHANGE THIS QUARTER'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 7, 'HOW SHOULD WE DOCUMENT FEEDBACK FOR FUTURE REVIEWS'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 8, 'WHAT RESOURCES WILL SUPPORT OUR LONG TERM GOALS'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 9, 'WHICH APPROACH MINIMIZES RISKS WITHOUT REDUCING QUALITY'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 10, 'WHEN ARE WE PRESENTING FINDINGS TO STAKEHOLDERS'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 11, 'WHO ELSE SHOULD ATTEND THE FOLLOW UP MEETING'),
  buildPuzzle(DifficultyLevel.B1, 'QUESTION', 12, 'HOW CAN WE VALIDATE THE DATA BEFORE RELEASE'),
];

const B1_THING = [
  buildPuzzle(DifficultyLevel.B1, 'THING', 1, 'THE SMART PROJECTOR SYNCS SEAMLESSLY WITH TABLETS'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 2, 'THE ADJUSTABLE STANDING DESK IMPROVES MY POSTURE'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 3, 'THE NOISE CANCELING HEADPHONES BLOCK DISTRACTIONS EFFECTIVELY'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 4, 'THE WIRELESS PRESENTER ADVANCES SLIDES RELIABLY'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 5, 'THE PORTABLE SCANNER STORES RECEIPTS AS PDFS'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 6, 'THE CERAMIC KNIFE MAINTAINS A SHARP EDGE'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 7, 'THE FOLDABLE DRONE PACKS INTO MY BACKPACK'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 8, 'THE STAINLESS THERMAL BOTTLE PRESERVES TEMPERATURES'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 9, 'THE LASER LEVEL ENSURES PERFECT PICTURE ALIGNMENT'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 10, 'THE VOICE RECORDER CAPTURES INTERVIEWS CLEARLY'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 11, 'THE MULTIFUNCTIONAL PRINTER HANDLES DOUBLE SIDED COPIES'),
  buildPuzzle(DifficultyLevel.B1, 'THING', 12, 'THE SOLAR CHARGER POWERS DEVICES DURING CAMPING'),
];

const B1_PLACE = [
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 1, 'THE RIVERSIDE BIKEWAY SUPPORTS SAFE NIGHT RIDES'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 2, 'THE RESTORED WAREHOUSE HOSTS ARTISAN WORKSHOPS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 3, 'THE COASTAL WETLANDS PROTECT MIGRATING BIRDS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 4, 'THE TECHNOLOGY HUB OFFERS HACKATHON WORKSPACES'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 5, 'THE HISTORIC THEATER FEATURES MULTILINGUAL TOURS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 6, 'THE SCIENCE PARK ENCOURAGES STARTUP COLLABORATIONS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 7, 'THE BAMBOO VILLAGE DEMONSTRATES SUSTAINABLE DESIGN'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 8, 'THE COASTAL HOSTEL PROVIDES COMMUNITY KITCHENS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 9, 'THE INNOVATION CENTER CONNECTS STUDENTS WITH MENTORS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 10, 'THE VILLAGE PLAZA CELEBRATES LANTERN FESTIVALS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 11, 'THE SECLUDED MONASTERY OFFERS SILENT RETREATS'),
  buildPuzzle(DifficultyLevel.B1, 'PLACE', 12, 'THE CITY ARCHIVE PRESERVES COLONIAL MAP COLLECTIONS'),
];

const B2_DAILY_LIFE = [
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 1, 'I STRUCTURE MORNINGS AROUND DEEP WORK INTERVALS'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 2, 'I PRIORITIZE REFLECTION JOURNALS BEFORE DIGITAL CORRESPONDENCE'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 3, 'I REASSESS WEEKLY GOALS DURING EVENING COMMUTES'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 4, 'I TRACK ENERGY PATTERNS TO SCHEDULE COMPLEX TASKS'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 5, 'I ROTATE RESPONSIBILITIES TO PREVENT DECISION FATIGUE'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 6, 'I PRACTICE INTENTIONAL STILLNESS BEFORE INTENSE NEGOTIATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 7, 'I DESIGN EVENING ROUTINES THAT SUPPORT ACTIVE RECOVERY'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 8, 'I LEVERAGE QUIET HOURS FOR STRATEGIC PLANNING'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 9, 'I AUDIT PRODUCTIVITY METRICS TO ELIMINATE BOTTLENECKS'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 10, 'I INTEGRATE MICRO BREAKS TO SUSTAIN FOCUS'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 11, 'I CULTIVATE MINDFUL HABITS THROUGH DELIBERATE PRACTICE'),
  buildPuzzle(DifficultyLevel.B2, 'DAILY LIFE', 12, 'I CONDUCT WEEKLY RETROSPECTIVES TO REFINE SYSTEMS'),
];

const B2_FOOD_DRINK = [
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 1, 'I ANALYZE FERMENTATION VARIABLES FOR CONSISTENT SOURDOUGH'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 2, 'I SOURCE FAIR TRADE COCOA FOR DESSERT PROGRAMS'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 3, 'I ENGINEER PLANT BASED MENUS AROUND COMPLETE PROTEINS'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 4, 'I OPTIMIZE BREW RATIOS TO BALANCE EXTRACTION'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 5, 'I CURATE TEA SERVICES EMPHASIZING REGIONAL TERROIR'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 6, 'I CONSULT NUTRITIONISTS WHEN REDESIGNING CAFETERIA OFFERINGS'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 7, 'I DOCUMENT SENSORY NOTES DURING COFFEE CUPPINGS'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 8, 'I TEACH KNIFE SKILLS WITH AN EMPHASIS ON SAFETY'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 9, 'I NEGOTIATE SUPPLIER CONTRACTS FOR SEASONAL PRODUCE'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 10, 'I RESEARCH HISTORICAL CUISINE TO INSPIRE MENU ROTATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 11, 'I DEVELOP GLUTEN FREE OPTIONS WITHOUT SACRIFICING TEXTURE'),
  buildPuzzle(DifficultyLevel.B2, 'FOOD & DRINK', 12, 'I LEAD FOOD SAFETY AUDITS FOR COMMUNITY KITCHENS'),
];

const B2_SCHOOL = [
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 1, 'I ARCHITECT INTERDISCIPLINARY MODULES THAT PROMOTE SYSTEMS THINKING'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 2, 'I IMPLEMENT SOCRATIC SEMINARS TO CULTIVATE CRITICAL INQUIRY'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 3, 'I MENTOR PEERS WHILE DEVELOPING ACTION RESEARCH PROJECTS'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 4, 'I INTEGRATE ANALYTICS DASHBOARDS TO TRACK LEARNING OUTCOMES'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 5, 'I FACILITATE DESIGN SPRINTS FOR STEM PROTOTYPES'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 6, 'I PUBLISH REFLECTIVE ESSAYS IN THE CAMPUS JOURNAL'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 7, 'I EVALUATE CURRICULA THROUGH EQUITY FOCUSED FRAMEWORKS'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 8, 'I NEGOTIATE DEADLINES WHEN PROJECT SCOPE EXPANDS'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 9, 'I CURATE PRIMARY SOURCES FOR HISTORICAL SIMULATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 10, 'I ENGINEER RUBRICS THAT WEIGH COLLABORATIVE CONTRIBUTIONS'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 11, 'I MODERATE PANEL DISCUSSIONS WITH VISITING SCHOLARS'),
  buildPuzzle(DifficultyLevel.B2, 'SCHOOL', 12, 'I PROTOTYPE ADAPTIVE QUIZZES USING OPEN STANDARDS'),
];

const B2_ANIMALS = [
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 1, 'I ANALYZE MARINE SOUND RECORDINGS TO MONITOR DOLPHINS'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 2, 'I COORDINATE RESCUE NETWORKS FOR DISPLACED WILDLIFE'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 3, 'I PUBLISH FIELD NOTES ON URBAN BIRD ADAPTATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 4, 'I MODEL POPULATION SHIFTS WITH CLIMATE DATASETS'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 5, 'I TRAIN CAREGIVERS TO ADMINISTER REHABILITATION REGIMENS'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 6, 'I ADVOCATE WETLAND PRESERVATION THROUGH POLICY FORUMS'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 7, 'I SUPERVISE DATA COLLECTION DURING BAT CENSUSES'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 8, 'I ASSESS ETHICAL STANDARDS FOR RESPONSIBLE ECOTOURISM'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 9, 'I CONSULT BEHAVIORISTS WHEN DESIGNING ENRICHMENT PROGRAMS'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 10, 'I SYNTHESIZE INDIGENOUS KNOWLEDGE WITH MODERN CONSERVATION'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 11, 'I DEVELOP AUDIO GUIDES THAT HIGHLIGHT MIGRATION STORIES'),
  buildPuzzle(DifficultyLevel.B2, 'ANIMALS', 12, 'I AUDIT SANCTUARY PRACTICES TO ENSURE COMPLIANCE'),
];

const B2_MOVIES = [
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 1, 'I DECONSTRUCT NONLINEAR NARRATIVES TO UNDERSTAND AUDIENCE ENGAGEMENT'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 2, 'I PRODUCE SHORT DOCUMENTARIES EXPLORING HISTORICAL MEMORY'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 3, 'I CURATE FESTIVAL LINEUPS THAT CHAMPION EMERGING DIRECTORS'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 4, 'I DISSECT SCORE ARRANGEMENTS TO MAP EMOTIONAL RHYTHMS'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 5, 'I NEGOTIATE DISTRIBUTION RIGHTS FOR STUDENT PRODUCTIONS'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 6, 'I LEAD PANEL DISCUSSIONS ON TRANSNATIONAL CINEMA'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 7, 'I RECONSTRUCT STORY ARCS TO HIGHLIGHT CHARACTER AGENCY'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 8, 'I MENTOR FILMMAKERS THROUGH POST PRODUCTION WORKFLOWS'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 9, 'I ANALYZE ARCHIVE FOOTAGE FOR CONTEXTUAL ACCURACY'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 10, 'I DESIGN ACCESSIBLE SCREENINGS WITH LIVE INTERPRETATION'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 11, 'I OPTIMIZE COLOR LUTS TO MATCH MULTIPLE CAMERAS'),
  buildPuzzle(DifficultyLevel.B2, 'MOVIES', 12, 'I AUTHOR CRITIQUES THAT INTERROGATE POWER STRUCTURES'),
];

const B2_FAMILY = [
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 1, 'I MEDIATE INTERGENERATIONAL EXPECTATIONS THROUGH TRANSPARENT DIALOGUE'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 2, 'I STEWARD FAMILY ARCHIVES USING DIGITAL PRESERVATION PRACTICES'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 3, 'I DESIGN WELLNESS PLANS TO SUPPORT CAREGIVER BURNOUT'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 4, 'I COORDINATE ROTATING MEAL PREP DURING RECOVERY PERIODS'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 5, 'I FACILITATE DIFFICULT CONVERSATIONS USING MEDIATION TECHNIQUES'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 6, 'I ORGANIZE LEGACY INTERVIEWS TO CAPTURE ELDER WISDOM'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 7, 'I ADVOCATE ACCESSIBLE HOUSING FOR AGING RELATIVES'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 8, 'I ANALYZE EXPENSE PATTERNS TO BALANCE SHARED BUDGETS'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 9, 'I LEAD MINDFULNESS SESSIONS DURING FAMILY RETREATS'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 10, 'I NEGOTIATE BOUNDARIES THAT RESPECT PERSONAL GROWTH'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 11, 'I DOCUMENT MIGRATION STORIES TO SHARE WITH CHILDREN'),
  buildPuzzle(DifficultyLevel.B2, 'FAMILY', 12, 'I CELEBRATE CULTURAL HERITAGE THROUGH CURATED EXPERIENCES'),
];

const B2_TRAVEL = [
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 1, 'I STRUCTURE EXPEDITIONS AROUND COMMUNITY LED LEARNING'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 2, 'I NEGOTIATE RECIPROCAL HOMESTAY AGREEMENTS WITH PARTNERS'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 3, 'I AUDIT CARBON FOOTPRINTS TO OFFSET LONG HAUL FLIGHTS'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 4, 'I STUDY DIASPORA NETWORKS TO INFORM TRAVEL NARRATIVES'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 5, 'I ADVOCATE ETHICAL TOURISM THROUGH MULTILINGUAL WORKSHOPS'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 6, 'I DESIGN INTERACTIVE MAPS HIGHLIGHTING ACCESSIBILITY DATA'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 7, 'I COORDINATE CULTURAL EXCHANGES WITH LOCAL HISTORIANS'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 8, 'I FACILITATE RISK ASSESSMENTS FOR REMOTE TREKS'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 9, 'I NEGOTIATE PERMITS THAT PROTECT SENSITIVE LANDSCAPES'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 10, 'I COMPOSE TRAVEL ESSAYS THAT INTERROGATE PRIVILEGE'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 11, 'I ARCHIVE PHOTO ESSAYS TO DOCUMENT URBAN TRANSFORMATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'TRAVEL', 12, 'I MENTOR STUDENTS PLANNING LANGUAGE IMMERSION JOURNEYS'),
];

const B2_HOBBIES = [
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 1, 'I CURATE INTERDISCIPLINARY WORKSHOPS BLENDING CODING AND ART'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 2, 'I ANALYZE JAZZ PROGRESSIONS TO EXPAND IMPROVISATION VOCABULARY'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 3, 'I RESTORE ANALOG CAMERAS TO DOCUMENT STREET LIFE'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 4, 'I CHOREOGRAPH SITE SPECIFIC PERFORMANCES WITH ARCHITECTS'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 5, 'I TRANSLATE CLASSICAL POETRY TO STUDY RHYTHMIC STRUCTURE'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 6, 'I BUILD OPEN SOURCE SYNTHESIZERS FROM RECYCLED CIRCUITS'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 7, 'I ORGANIZE CHARITY ESPORTS TOURNAMENTS WITH STREAMING TEAMS'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 8, 'I FACILITATE WRITERS ROOMS FOR COMMUNITY RADIO PLAYS'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 9, 'I EXPERIMENT WITH INDIGO DYEING TO PRESERVE TRADITIONS'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 10, 'I DEVELOP TABLETOP SCENARIOS THAT TEACH CONFLICT RESOLUTION'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 11, 'I NARRATE AUDIO DOCUMENTARIES ABOUT MIGRANT ARTISTS'),
  buildPuzzle(DifficultyLevel.B2, 'HOBBIES', 12, 'I MENTOR YOUNGSTERS CURIOUS ABOUT QUANTUM PROGRAMMING'),
];

const B2_PHRASE = [
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 1, 'PLEASE OUTLINE YOUR RATIONALE BEFORE WE PROCEED'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 2, 'THANK YOU FOR SUSTAINING SUCH THOUGHTFUL DIALOGUE'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 3, 'I VALUE HOW TRANSPARENTLY YOU DISCUSS UNCERTAINTY'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 4, 'PLEASE CLARIFY WHICH ASSUMPTIONS GUIDED YOUR ANALYSIS'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 5, 'COULD YOU SYNTHESIZE THE KEY IMPLICATIONS FOR US'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 6, 'I APPRECIATE YOUR WILLINGNESS TO REVISE STRATEGIES'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 7, 'LET US INTERROGATE THE DATA FROM MULTIPLE ANGLES'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 8, 'PLEASE DOCUMENT ANY DEPENDENCIES BEFORE HANDOFF'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 9, 'THANK YOU FOR HOLDING SPACE DURING DIFFICULT MOMENTS'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 10, 'I RESPECT THE NUANCES YOU BROUGHT INTO DISCUSSION'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 11, 'PLEASE FLAG RISKS EARLY SO WE CAN ADAPT'),
  buildPuzzle(DifficultyLevel.B2, 'PHRASE', 12, 'COULD WE COCREATE A FOLLOW UP FRAMEWORK'),
];

const B2_QUESTION = [
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 1, 'WHAT CONTINGENCIES MUST WE PLAN FOR IMPLEMENTATION'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 2, 'HOW MIGHT THESE FINDINGS DISRUPT EXISTING ASSUMPTIONS'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 3, 'WHICH METRICS BEST CAPTURE LONGITUDINAL IMPACT'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 4, 'WHEN WILL THE STAKEHOLDERS REVIEW OUR PROPOSAL'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 5, 'WHO CAN ESCALATE CONCERNS DURING OFF HOURS'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 6, 'WHY SHOULD WE PRIORITIZE TRANSPARENCY OVER SPEED'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 7, 'HOW COULD WE MITIGATE UNFORESEEN REGULATORY DELAYS'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 8, 'WHAT WOULD SUCCESS LOOK LIKE FOR PARTNERS'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 9, 'WHICH VARIABLES REQUIRE CONTINUOUS MONITORING AFTER LAUNCH'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 10, 'WHEN ARE WE SUBMITTING THE ETHICS DOCUMENTATION'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 11, 'WHO ELSE NEEDS ACCESS TO THESE DASHBOARDS'),
  buildPuzzle(DifficultyLevel.B2, 'QUESTION', 12, 'HOW WILL WE EVALUATE THE PILOT COHORT'),
];

const B2_THING = [
  buildPuzzle(DifficultyLevel.B2, 'THING', 1, 'THE MODULAR SERVER RACK SUPPORTS RAPID RECONFIGURATION'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 2, 'THE QUANTUM SENSOR CALIBRATES WITH MINIMAL DRIFT'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 3, 'THE KINETIC KEYBOARD ADAPTS TO ERGONOMIC MICROADJUSTMENTS'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 4, 'THE HOLOGRAPHIC DISPLAY PROJECTS MULTILAYERED DATASETS'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 5, 'THE CARBON FIBER TRIPOD STABILIZES DURING STORMS'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 6, 'THE AUTOMATED GREENHOUSE REGULATES HUMIDITY PRECISELY'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 7, 'THE PORTABLE SPECTROMETER IDENTIFIES TRACE MINERALS'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 8, 'THE ANALOG SYNTHESIZER OFFERS MODULAR PATCH ROUTES'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 9, 'THE IMMERSIVE HEADSET RENDERS TRUE TO SCALE ENVIRONMENTS'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 10, 'THE OPEN SOURCE CLOCK TRACKS ATOMIC OSCILLATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 11, 'THE FOLDABLE MICROSCOPE MAINTAINS LAB GRADE CLARITY'),
  buildPuzzle(DifficultyLevel.B2, 'THING', 12, 'THE HYBRID NOTEBOOK SYNCS WITH ENCRYPTED BACKUPS'),
];

const B2_PLACE = [
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 1, 'THE MARITIME MUSEUM CURATES IMMERSIVE NAVIGATION SIMULATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 2, 'THE URBAN FARM INCUBATES SOCIAL ENTERPRISES YEAR ROUND'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 3, 'THE MAKER DISTRICT FACILITATES CROSS DISCIPLINARY COLLABORATION'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 4, 'THE RESILIENCE HUB COORDINATES DISASTER RESPONSE TRAINING'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 5, 'THE HISTORICAL ARCHIVE DIGITIZES FRAGILE MANUSCRIPTS'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 6, 'THE COASTAL OBSERVATORY MONITORS RISING TIDE PATTERNS'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 7, 'THE INNOVATION COMMONS OFFERS CONTINUOUS PROTOTYPING LABS'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 8, 'THE LITERARY SALON HOSTS TRANSLATION RESIDENCIES'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 9, 'THE RENEWABLE CAMPUS OPERATES ON MICROGRID TECHNOLOGY'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 10, 'THE ORBITAL EXHIBIT SIMULATES FUTURE HABITATS'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 11, 'THE DESERT INSTITUTE STUDIES EXTREME ADAPTATIONS'),
  buildPuzzle(DifficultyLevel.B2, 'PLACE', 12, 'THE SKY PARK INTEGRATES BOTANY WITH PUBLIC ART'),
];

const A1_PUZZLES: Record<string, DefaultEflPuzzle[]> = {
  'DAILY LIFE': A1_DAILY_LIFE,
  'FOOD & DRINK': A1_FOOD_DRINK,
  SCHOOL: A1_SCHOOL,
  ANIMALS: A1_ANIMALS,
  MOVIES: A1_MOVIES,
  FAMILY: A1_FAMILY,
  TRAVEL: A1_TRAVEL,
  HOBBIES: A1_HOBBIES,
  PHRASE: A1_PHRASE,
  QUESTION: A1_QUESTION,
  THING: A1_THING,
  PLACE: A1_PLACE,
};

const A2_PUZZLES: Record<string, DefaultEflPuzzle[]> = {
  'DAILY LIFE': A2_DAILY_LIFE,
  'FOOD & DRINK': A2_FOOD_DRINK,
  SCHOOL: A2_SCHOOL,
  ANIMALS: A2_ANIMALS,
  MOVIES: A2_MOVIES,
  FAMILY: A2_FAMILY,
  TRAVEL: A2_TRAVEL,
  HOBBIES: A2_HOBBIES,
  PHRASE: A2_PHRASE,
  QUESTION: A2_QUESTION,
  THING: A2_THING,
  PLACE: A2_PLACE,
};

const B1_PUZZLES: Record<string, DefaultEflPuzzle[]> = {
  'DAILY LIFE': B1_DAILY_LIFE,
  'FOOD & DRINK': B1_FOOD_DRINK,
  SCHOOL: B1_SCHOOL,
  ANIMALS: B1_ANIMALS,
  MOVIES: B1_MOVIES,
  FAMILY: B1_FAMILY,
  TRAVEL: B1_TRAVEL,
  HOBBIES: B1_HOBBIES,
  PHRASE: B1_PHRASE,
  QUESTION: B1_QUESTION,
  THING: B1_THING,
  PLACE: B1_PLACE,
};

const B2_PUZZLES: Record<string, DefaultEflPuzzle[]> = {
  'DAILY LIFE': B2_DAILY_LIFE,
  'FOOD & DRINK': B2_FOOD_DRINK,
  SCHOOL: B2_SCHOOL,
  ANIMALS: B2_ANIMALS,
  MOVIES: B2_MOVIES,
  FAMILY: B2_FAMILY,
  TRAVEL: B2_TRAVEL,
  HOBBIES: B2_HOBBIES,
  PHRASE: B2_PHRASE,
  QUESTION: B2_QUESTION,
  THING: B2_THING,
  PLACE: B2_PLACE,
};

const flattenCatalog = (catalog: DefaultEflPuzzleCatalog): DefaultEflPuzzle[] =>
  Object.values(catalog).flatMap((categoryMap) => Object.values(categoryMap).flat());

export const DEFAULT_EFL_PUZZLE_CATALOG: DefaultEflPuzzleCatalog = {
  [DifficultyLevel.A1]: A1_PUZZLES,
  [DifficultyLevel.A2]: A2_PUZZLES,
  [DifficultyLevel.B1]: B1_PUZZLES,
  [DifficultyLevel.B2]: B2_PUZZLES,
};

export const DEFAULT_EFL_PUZZLES: DefaultEflPuzzle[] = flattenCatalog(DEFAULT_EFL_PUZZLE_CATALOG);
