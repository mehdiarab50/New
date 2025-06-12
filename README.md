# بازی استراتژیک: جنگ بزرگ ایران و آمریکا (Iran vs USA: The Great War)

این یک بازی استراتژیک نوبتی ساده است که در آن بازیکنان کنترل نیروهای ایران یا آمریکا را به دست می‌گیرند. این پروژه با جاوا اسکریپت، HTML و CSS ساخته شده است.

This is a simple turn-based strategy game where players control the forces of either Iran or the USA. This project is built with JavaScript, HTML, and CSS.

---

## راهنمای بازی (فارسی)

### هدف بازی
هدف اصلی در بازی استراتژیک "جنگ بزرگ ایران و آمریکا"، تصرف پایتخت کشور دشمن است. هر بازیکنی که زودتر بتواند با یکی از نیروهای خود وارد خانه پایتخت دشمن شود، برنده بازی خواهد بود.

### شروع بازی
1.  فایل `index.html` را در یک مرورگر وب مدرن (مانند کروم، فایرفاکس و ...) باز کنید.
2.  بازی به طور خودکار بارگذاری شده و نقشه به همراه نیروهای اولیه دو کشور نمایان می‌شود.
3.  نوبت اول با ایران است. پیامی در بخش اطلاعات بازی این موضوع را نشان می‌دهد.

### روند بازی و نوبت‌ها
بازی به صورت نوبتی انجام می‌شود. هر بازیکن در نوبت خود می‌تواند با تمام واحدهای خود (که هنوز حرکت نکرده یا حمله نکرده‌اند) عملیاتی انجام دهد. پس از اتمام عملیات، باید روی دکمه "پایان نوبت" کلیک کنید تا نوبت به بازیکن دیگر منتقل شود.

### انتخاب واحد
-   برای انتخاب یک واحد نظامی، کافیست روی آن در نقشه کلیک کنید.
-   واحد انتخابی با یک نشانگر خاص (معمولاً یک حاشیه زرد رنگ) مشخص می‌شود.
-   اطلاعات واحد انتخاب شده (نام، میزان سلامتی، وضعیت حرکت و حمله در این نوبت) در بخش "اطلاعات بازی" نمایش داده می‌شود.
-   برای لغو انتخاب یک واحد، می‌توانید دوباره روی همان واحد کلیک کنید یا روی یک خانه خالی از نقشه کلیک نمایید.

### قابلیت‌های واحدها
هر واحد نظامی دارای مشخصات زیر است که بر نحوه عملکرد آن تاثیر می‌گذارد:
-   **سلامتی (HP):** میزان آسیبی که یک واحد قبل از نابودی می‌تواند تحمل کند.
-   **قدرت حمله:** میزان آسیبی که واحد در هنگام حمله به دشمن وارد می‌کند.
-   **قدرت دفاع:** میزان مقاومت واحد در برابر حمله دشمن (از قدرت حمله دشمن می‌کاهد).
-   **محدوده حرکت:** تعداد خانه‌هایی که واحد می‌تواند در یک نوبت طی کند. (در این بازی، حرکت به صورت افقی و عمودی است و هر خانه یک واحد حرکت محسوب می‌شود).

دو نوع واحد در بازی وجود دارد:
1.  **پیاده نظام (Inf):** قدرت حمله و دفاع متوسط، محدوده حرکت بیشتر.
2.  **تانک (Tnk):** قدرت حمله و دفاع بالا، محدوده حرکت کمتر.

### حرکت دادن واحدها
1.  ابتدا واحد مورد نظر خود را انتخاب کنید.
2.  خانه‌هایی که واحد می‌تواند به آن‌ها حرکت کند با رنگ سبز روشن مشخص می‌شوند.
3.  روی یکی از خانه‌های مجاز (سبز رنگ) کلیک کنید تا واحد به آنجا منتقل شود.
4.  یک واحد پس از حرکت در یک نوبت، دیگر نمی‌تواند در همان نوبت حرکت کند.
5.  واحدها نمی‌توانند وارد خانه‌هایی شوند که توسط نیروهای خودی اشغال شده‌اند.

### حمله به دشمن
1.  ابتدا واحد مورد نظر خود را انتخاب کنید.
2.  اگر واحد دشمنی در همسایگی واحد شما قرار داشته باشد (یک خانه فاصله افقی یا عمودی) و واحد شما هنوز در این نوبت حمله نکرده باشد، آن واحد دشمن با رنگ قرمز روشن (یا نارنجی) مشخص می‌شود.
3.  برای حمله، روی واحد دشمن قابل حمله کلیک کنید.
4.  محاسبه آسیب: آسیب وارد شده به دشمن برابر است با `قدرت حمله مهاجم - قدرت دفاع مدافع`. (حداقل آسیب ۱ خواهد بود).
5.  میزان سلامتی واحد مدافع کاهش می‌یابد. اگر سلامتی آن به صفر یا کمتر برسد، واحد از بازی حذف می‌شود.
6.  واحدی که حمله می‌کند، در همان نوبت دیگر نمی‌تواند حرکت یا حمله دیگری انجام دهد.

### پایان نوبت
پس از انجام تمام حرکات و حملات مورد نظر، روی دکمه "پایان نوبت" در بخش اطلاعات بازی کلیک کنید. نوبت به بازیکن دیگر منتقل شده و وضعیت حرکت و حمله نیروهای بازیکن جدید برای آن نوبت بازنشانی می‌شود.

### پیروزی در بازی
-   بازیکنی که بتواند یکی از واحدهای خود را به خانه پایتخت دشمن منتقل کند، فوراً برنده بازی اعلام می‌شود.
-   پیام پیروزی در بخش گزارش بازی نمایش داده شده و بازی به پایان می‌رسد.

### گزارش بازی
در بخش اطلاعات بازی، یک قسمت برای "گزارش بازی" وجود دارد. تمام اقدامات مهم مانند انتخاب واحد، حرکت، نتایج حمله، تغییر نوبت و پیام پیروزی در این قسمت ثبت می‌شوند تا بتوانید روند بازی را دنبال کنید.

---

## Game Tutorial (English)

### Objective
The main goal in the strategy game "The Great War: Iran vs. USA" is to capture the enemy's capital city. The first player to move one of their units onto the enemy's capital hex wins the game.

### Starting the Game
1.  Open the `index.html` file in a modern web browser (e.g., Chrome, Firefox, etc.).
2.  The game will load automatically, displaying the map along with the initial forces for both countries.
3.  Iran takes the first turn. A message in the game information panel will indicate this.

### Gameplay and Turns
The game is turn-based. Each player, during their turn, can perform actions with all their units that haven't already moved or attacked in that turn. After completing all actions, you must click the "End Turn" button to pass the turn to the other player.

### Selecting a Unit
-   To select a military unit, simply click on it on the map.
-   The selected unit will be highlighted with a special marker (usually a yellow border).
-   Information about the selected unit (name, health points (HP), movement and attack status for the current turn) will be displayed in the "Game Info" panel.
-   To deselect a unit, you can click on the same unit again or click on an empty map cell.

### Unit Capabilities
Each military unit has the following attributes that affect its performance:
-   **Health (HP):** The amount of damage a unit can sustain before being destroyed.
-   **Attack Power:** The amount of damage the unit inflicts when attacking an enemy.
-   **Defense Power:** The unit's resistance to enemy attacks (reduces damage taken from the enemy's attack power).
-   **Movement Range:** The number of cells a unit can move in a single turn. (In this game, movement is horizontal and vertical, with each cell costing one movement point).

There are two types of units in the game:
1.  **Infantry (Inf):** Moderate attack and defense, higher movement range.
2.  **Tank (Tnk):** High attack and defense, lower movement range.

### Moving Units
1.  First, select the unit you want to move.
2.  Cells where the unit can move will be highlighted in light green.
3.  Click on one of the valid (green-highlighted) cells to move the unit there.
4.  Once a unit has moved in a turn, it generally cannot move again in the same turn.
5.  Units cannot move into cells occupied by friendly units.

### Attacking the Enemy
1.  First, select your attacking unit.
2.  If an enemy unit is adjacent (one cell away horizontally or vertically) to your unit, and your unit has not yet attacked in this turn, the enemy unit will be highlighted (e.g., in light red or orange).
3.  To attack, click on the highlighted attackable enemy unit.
4.  Damage Calculation: Damage inflicted on the enemy is `Attacker's Attack Power - Defender's Defense Power`. (Minimum damage will be 1).
5.  The defending unit's HP will decrease. If its HP drops to zero or less, the unit is removed from the game.
6.  A unit that attacks cannot move further or perform another attack in the same turn.

### Ending Your Turn
After performing all desired movements and attacks, click the "End Turn" button in the Game Info panel. The turn will pass to the other player, and the movement/attack statuses of their units will be reset for their new turn.

### Winning the Game
-   The player who successfully moves one of their units onto the enemy's capital cell is immediately declared the winner.
-   A victory message will be displayed in the game log, and the game will end.

### Game Log
In the Game Info panel, there is a "Game Log" section. All important actions such as unit selection, movement, attack results, turn changes, and victory messages are recorded here so you can follow the game's progress.

---
ساخته شده توسط یک عامل هوش مصنوعی.
Created by an AI agent.
