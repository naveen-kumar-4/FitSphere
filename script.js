// ==========================================================================
// FITSPHERE - CHILD GROWTH & WELLNESS PLATFORM
// Client-side Application Logic & Pediatric Growth Reference Engine
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {

    // --- DOM Elements ---
    const form = document.getElementById("growthForm");
    const results = document.getElementById("results");
    const toastContainer = document.getElementById("toastContainer");
    const backToTopBtn = document.getElementById("backToTopBtn");

    // Unit Switcher Elements
    const unitMetricBtn = document.getElementById("unitMetric");
    const unitImperialBtn = document.getElementById("unitImperial");
    const metricInputs = document.getElementById("metricInputs");
    const imperialInputs = document.getElementById("imperialInputs");

    // Form Inputs
    const childNameInput = document.getElementById("childName");
    const ageYearsInput = document.getElementById("ageYears");
    const ageMonthsInput = document.getElementById("ageMonths");
    const heightInput = document.getElementById("height");
    const weightInput = document.getElementById("weight");
    const heightFtInput = document.getElementById("heightFt");
    const heightInInput = document.getElementById("heightIn");
    const weightLbsInput = document.getElementById("weightLbs");
    const measurementSelect = document.getElementById("measurement");
    const measurementTip = document.getElementById("measurementTip");
    const activitySelect = document.getElementById("activity");
    const concernSelect = document.getElementById("concern");

    // Mobile Navigation Elements
    const menuToggle = document.getElementById("menuToggle");
    const menuOverlay = document.getElementById("menuOverlay");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileCloseBtn = document.getElementById("mobileCloseBtn");

    // Current State
    let currentProfile = null;
    let currentUnit = "metric"; // 'metric' or 'imperial'

    // ==========================================================================
    // 1. TOAST NOTIFICATION SYSTEM
    // ==========================================================================
    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        let icon = "ℹ️";
        if (type === "success") icon = "✅";
        if (type === "error") icon = "⚠️";

        toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ==========================================================================
    // 3. MOBILE MENU TOGGLE
    // ==========================================================================
    function toggleMobileMenu(open) {
        if (open) {
            mobileMenu.classList.add("open");
            menuOverlay.classList.add("open");
            menuToggle.classList.add("open");
            menuToggle.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
        } else {
            mobileMenu.classList.remove("open");
            menuOverlay.classList.remove("open");
            menuToggle.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        }
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.contains("open");
        toggleMobileMenu(!isOpen);
    });

    mobileCloseBtn.addEventListener("click", () => toggleMobileMenu(false));
    menuOverlay.addEventListener("click", () => toggleMobileMenu(false));

    // Close mobile menu when navigating
    document.querySelectorAll(".mobile-menu .mobile-link, .mobile-cta-btn").forEach(link => {
        link.addEventListener("click", () => toggleMobileMenu(false));
    });

    // ==========================================================================
    // 4. UNIT CONVERSIONS & TOGGLE (Metric ⇄ Imperial)
    // ==========================================================================
    function syncUnits(targetUnit) {
        if (targetUnit === currentUnit) return;

        if (targetUnit === "imperial") {
            // Convert Metric to Imperial
            const cm = parseFloat(heightInput.value);
            const kg = parseFloat(weightInput.value);

            if (!isNaN(cm) && cm > 0) {
                const totalInches = cm / 2.54;
                const feet = Math.floor(totalInches / 12);
                const inches = Math.round((totalInches % 12) * 10) / 10;
                heightFtInput.value = feet;
                heightInInput.value = inches;
            }
            if (!isNaN(kg) && kg > 0) {
                weightLbsInput.value = (kg * 2.20462).toFixed(1);
            }

            metricInputs.hidden = true;
            imperialInputs.hidden = false;
            unitMetricBtn.classList.remove("active");
            unitImperialBtn.classList.add("active");
            currentUnit = "imperial";
        } else {
            // Convert Imperial to Metric
            const feet = parseFloat(heightFtInput.value) || 0;
            const inches = parseFloat(heightInInput.value) || 0;
            const lbs = parseFloat(weightLbsInput.value);

            if (feet > 0 || inches > 0) {
                const cm = Math.round(((feet * 12) + inches) * 2.54 * 10) / 10;
                heightInput.value = cm;
            }
            if (!isNaN(lbs) && lbs > 0) {
                weightInput.value = (lbs / 2.20462).toFixed(1);
            }

            imperialInputs.hidden = true;
            metricInputs.hidden = false;
            unitImperialBtn.classList.remove("active");
            unitMetricBtn.classList.add("active");
            currentUnit = "metric";
        }
    }

    unitMetricBtn.addEventListener("click", () => syncUnits("metric"));
    unitImperialBtn.addEventListener("click", () => syncUnits("imperial"));

    // ==========================================================================
    // 5. AGE-BASED MEASUREMENT AUTO-SUGGESTION
    // ==========================================================================
    ageYearsInput.addEventListener("input", function () {
        const years = parseInt(this.value, 10);
        if (isNaN(years)) return;

        if (years < 2) {
            measurementSelect.value = "lying";
            measurementTip.textContent = "💡 For infants and toddlers under 2, measuring lying-down recumbent length is standard.";
        } else {
            measurementSelect.value = "standing";
            measurementTip.textContent = "💡 For children aged 2 and older, standing height is the standard pediatric measurement.";
        }
    });

    // ==========================================================================
    // 6. (DEMO REMOVED)
    // ==========================================================================

    // ==========================================================================
    // 7. GET PROFILE DATA & VALIDATION
    // ==========================================================================
    function getProfile() {
        const name = childNameInput.value.trim();
        const yearsStr = ageYearsInput.value.trim();
        const monthsStr = ageMonthsInput.value;

        if (!name) {
            showToast("Please enter the child's name.", "error");
            childNameInput.focus();
            return null;
        }

        if (yearsStr === "") {
            showToast("Please enter the child's age in years (0 to 10).", "error");
            ageYearsInput.focus();
            return null;
        }

        const years = Number(yearsStr);
        const months = Number(monthsStr);

        if (!Number.isInteger(years) || years < 0 || years > 10) {
            showToast("FitSphere supports children aged 0 to 10 years.", "error");
            ageYearsInput.focus();
            return null;
        }

        if (years === 10 && months > 0) {
            showToast("FitSphere supports children up to 10 years of age.", "error");
            return null;
        }

        if (years === 0 && months === 0) {
            showToast("For newborns under 1 year, please select the age in months.", "error");
            ageMonthsInput.focus();
            return null;
        }

        const sexRadio = document.querySelector('input[name="sex"]:checked');
        if (!sexRadio) {
            showToast("Please select whether the child is a Boy or a Girl.", "error");
            return null;
        }

        let height = 0;
        let weight = 0;

        if (currentUnit === "metric") {
            height = parseFloat(heightInput.value);
            weight = parseFloat(weightInput.value);

            if (isNaN(height) || height < 30 || height > 150) {
                showToast("Please enter a valid height between 30 cm and 150 cm.", "error");
                heightInput.focus();
                return null;
            }

            if (isNaN(weight) || weight < 1 || weight > 60) {
                showToast("Please enter a valid weight between 1 kg and 60 kg.", "error");
                weightInput.focus();
                return null;
            }
        } else {
            const feet = parseFloat(heightFtInput.value) || 0;
            const inches = parseFloat(heightInInput.value) || 0;
            const lbs = parseFloat(weightLbsInput.value);

            const totalInches = (feet * 12) + inches;
            height = Math.round(totalInches * 2.54 * 10) / 10;

            if (isNaN(height) || height < 30 || height > 150) {
                showToast("Please enter a valid height in feet and inches.", "error");
                heightFtInput.focus();
                return null;
            }

            if (isNaN(lbs) || lbs < 2 || lbs > 132) {
                showToast("Please enter a valid weight in pounds (2 to 132 lbs).", "error");
                weightLbsInput.focus();
                return null;
            }

            weight = Math.round((lbs / 2.20462) * 10) / 10;
        }

        const measurement = measurementSelect.value;
        const activity = activitySelect.value;
        const concern = concernSelect.value;

        return {
            name,
            years,
            months,
            ageInMonths: (years * 12) + months,
            height,
            weight,
            sex: sexRadio.value,
            activity,
            concern,
            measurement,
            unitUsed: currentUnit
        };
    }

    // ==========================================================================
    // 8. BMI CALCULATION & PEDIATRIC GROWTH CLASSIFICATION
    // ==========================================================================
    function calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return parseFloat(bmi.toFixed(2));
    }

    // Evidence-based age-adjusted pediatric BMI categories (WHO 0-5y & IAP/WHO 5-18y)
    function evaluatePediatricBMI(bmi, ageInMonths, sex) {
        // Median and cutoffs vary across ages:
        // For under 2y: BMI ranges ~14.5 to 18.5
        // For 2-5y: BMI ranges ~13.8 to 17.5
        // For 6-11y: BMI ranges ~14.0 to 19.5
        // For 12-18y: BMI ranges ~16.0 to 24.0

        let underCutoff, healthyMax, riskMax;

        if (ageInMonths <= 24) {
            underCutoff = 14.5;
            healthyMax = 18.5;
            riskMax = 20.0;
        } else if (ageInMonths <= 60) { // 2 to 5 years
            underCutoff = 13.8;
            healthyMax = 17.5;
            riskMax = 19.0;
        } else if (ageInMonths <= 108) { // 5 to 9 years
            underCutoff = 13.5;
            healthyMax = 18.2;
            riskMax = 20.5;
        } else { // 9 to 10 years
            underCutoff = 14.0;
            healthyMax = 19.5;
            riskMax = 22.0;
        }

        // Slight sex adjustments (girls have slightly different reference medians)
        if (sex === "girl") {
            underCutoff -= 0.2;
            healthyMax -= 0.2;
            riskMax -= 0.2;
        }

        let category = "Healthy Weight";
        let badgeColor = "#10b981"; // green
        let description = "Growth parameters are in the healthy pediatric zone. Maintain nourishing family routines and active play.";
        let gaugePercent = 50;

        if (bmi < underCutoff) {
            category = "Lower Weight Range";
            badgeColor = "#f59e0b"; // amber
            description = "Measurements place the child in the lower percentile range. Ensure nutrient-dense meals and consult your pediatrician if weight gain is slow.";
            gaugePercent = Math.max(10, Math.min(25, (bmi / underCutoff) * 25));
        } else if (bmi <= healthyMax) {
            category = "Healthy Weight Zone";
            badgeColor = "#10b981"; // green
            description = "Height and weight are well-proportioned for this age group according to international pediatric growth standards.";
            const range = healthyMax - underCutoff;
            gaugePercent = 25 + Math.min(45, ((bmi - underCutoff) / range) * 45);
        } else if (bmi <= riskMax) {
            category = "Overweight Risk / Upper Range";
            badgeColor = "#f97316"; // orange
            description = "Growth trajectory is trending above average. Focus on balanced whole foods, limiting sugary drinks and screen time, and enjoying active games.";
            const range = riskMax - healthyMax;
            gaugePercent = 70 + Math.min(15, ((bmi - healthyMax) / range) * 15);
        } else {
            category = "Elevated Weight Range";
            badgeColor = "#ef4444"; // red
            description = "Measurements are in the upper percentile bracket. A pediatrician or pediatric dietitian can offer supportive, shame-free guidance for positive lifestyle habits.";
            gaugePercent = Math.min(95, 85 + ((bmi - riskMax) / 5) * 10);
        }

        return {
            category,
            badgeColor,
            description,
            gaugePercent: Math.round(gaugePercent)
        };
    }

    function getGrowthReference(profile) {
        if (profile.ageInMonths <= 60) {
            return {
                name: "WHO Child Growth Standards",
                range: "Birth to 5 years (Length/Height-for-age, Weight-for-age, BMI-for-age)",
                message: "WHO Child Growth Standards are based on healthy children raised in optimal environments worldwide. For children under 2, recumbent length is compared to length-for-age standards."
            };
        } else {
            return {
                name: "Indian Academy of Pediatrics (IAP) & WHO References",
                range: "5 to 18 years (Growth Percentiles & BMI Curves)",
                message: "IAP growth charts provide age- and sex-calibrated height, weight, and BMI reference curves reflecting regional diversity and adolescent growth spurts."
            };
        }
    }

    // ==========================================================================
    // 9. DAILY WELLNESS TARGETS (Age-Tailored Benchmarks)
    // ==========================================================================
    function getDailyTargets(ageInMonths) {
        if (ageInMonths < 12) {
            return [
                { icon: "😴", title: "Daily Sleep", value: "12 – 16 Hours", note: "Includes 2-3 daytime naps for optimal brain development." },
                { icon: "💧", title: "Hydration", value: "Milk on Demand", note: "Breastmilk or formula; tiny sips of water after 6 months." },
                { icon: "🏃", title: "Physical Play", value: "30+ Mins Tummy Time", note: "Floor play, reaching, kicking, and tummy time across the day." },
                { icon: "📱", title: "Screen Time", value: "0 Hours", note: "Avoid digital screens except interactive family video chatting." }
            ];
        } else if (ageInMonths < 36) { // 1 to 3 years
            return [
                { icon: "😴", title: "Daily Sleep", value: "11 – 14 Hours", note: "Includes 1-2 restful daytime naps." },
                { icon: "💧", title: "Hydration", value: "~1.0 – 1.2 Liters", note: "Approx 4 small cups of water and milk daily." },
                { icon: "🏃", title: "Physical Play", value: "180+ Mins Active", note: "Running, climbing, dancing, and outdoor playground fun." },
                { icon: "📱", title: "Screen Time", value: "None to Minimal", note: "If introduced, max 30-45 mins co-viewed educational content." }
            ];
        } else if (ageInMonths <= 60) { // 3 to 5 years
            return [
                { icon: "😴", title: "Daily Sleep", value: "10 – 13 Hours", note: "May include 1 afternoon nap; maintain a cozy bedtime ritual." },
                { icon: "💧", title: "Hydration", value: "1.2 – 1.4 Liters", note: "Approx 5 cups of fresh water spread through the day." },
                { icon: "🏃", title: "Physical Play", value: "60+ Mins Energetic", note: "Running, jumping, tricycle riding, obstacle games." },
                { icon: "📱", title: "Screen Time", value: "Max 1 Hour", note: "High-quality, age-appropriate educational programming." }
            ];
        } else if (ageInMonths <= 144) { // 6 to 12 years
            return [
                { icon: "😴", title: "Daily Sleep", value: "9 – 12 Hours", note: "Crucial for memory consolidation, focus, and growth hormone release." },
                { icon: "💧", title: "Hydration", value: "1.5 – 1.8 Liters", note: "Approx 6-7 cups of plain water; hydrate before & after sports." },
                { icon: "🏃", title: "Physical Play", value: "60+ Mins Moderate/Vigorous", note: "Sports (football, cricket, badminton), swimming, active games." },
                { icon: "📱", title: "Screen Time", value: "Max 1.5 – 2 Hours", note: "Keep screens out of the bedroom overnight." }
            ];
        } else { // 13 to 18 years
            return [
                { icon: "😴", title: "Daily Sleep", value: "8 – 10 Hours", note: "Consistent sleep schedule supports mood, hormones, and academics." },
                { icon: "💧", title: "Hydration", value: "2.0 – 2.5 Liters", note: "Approx 8-10 glasses of water; avoid high-sugar energy drinks." },
                { icon: "🏃", title: "Physical Play", value: "60+ Mins Daily", note: "Combination of aerobic exercise, sports, and bodyweight training." },
                { icon: "📱", title: "Screen Time", value: "Balanced Habits", note: "Encourage digital boundaries and device-free meal times." }
            ];
        }
    }

    // ==========================================================================
    // 10. NUTRITION, ACTIVITY & LIFESTYLE SUGGESTIONS
    // ==========================================================================
    const GUIDE = {
        b0: {
            label: "Newborn to 5 months",
            nutrition: ["Exclusive breastfeeding on demand (8–12 feeds/day) meets all needs; no water, honey, ghutti or top feeds.", "If not breastfed, use only standard infant formula prepared with boiled, cooled water exactly as per the tin.", "Give vitamin D drops (about 400 IU/day) if your pediatrician advises."],
            food: ["Feed on hunger cues (rooting, hand-to-mouth) rather than the clock.", "Burp after feeds and keep the baby upright for 15–20 minutes to reduce spit-up.", "Wash hands and sterilise bottles, nipples and pump parts every time."],
            health: ["Place baby on the back to sleep, on a firm flat surface with nothing loose in the cot.", "Keep the cord stump clean and dry; bathe with lukewarm water and mild baby soap.", "Fever of 100.4°F (38°C) or higher in a baby under 3 months needs a doctor right away."],
            checkups: ["Birth doses: BCG, OPV-0 and Hepatitis B.", "6, 10 and 14 weeks: DTP, IPV, Hib, Hep B, Rotavirus and PCV.", "Weight and length check at every visit; ask about newborn screening."],
            milestones: ["Follows faces and sounds; smiles socially by about 2 months.", "Holds head up in tummy time by 3–4 months."]
        },
        b6: {
            label: "6 to 11 months",
            nutrition: ["Start solids at 6 months while continuing breastfeeding/formula: ragi porridge, dal khichdi, mashed banana, well-cooked egg, curd.", "Prioritise iron: ragi, dal, egg, meat/fish and green leafy vegetables with a vitamin C food such as lemon or tomato.", "Aim for 2–3 meals by 8 months and 3 meals + 1–2 snacks by 9–11 months."],
            food: ["Introduce one new food at a time, 3 days apart, and watch for rash, vomiting or swelling.", "Move from smooth purée to mashed and soft finger foods; let baby self-feed and explore.", "No salt, sugar, honey, packaged baby snacks, cow's milk as a drink, juice, whole nuts, grapes or popcorn."],
            health: ["Offer small sips of boiled-cooled water with meals once solids begin.", "Start brushing the first teeth with a rice-grain smear of fluoride toothpaste.", "Baby-proof the home: socket covers, no small objects in reach, and never leave baby alone near water."],
            checkups: ["6 months: influenza (yearly) plus a growth and anaemia review.", "9 months: MMR-1 and typhoid conjugate vaccine.", "Hearing, vision and development screening at routine visits."],
            milestones: ["Sits without support by 6–8 months; crawls and pulls to stand by 9–11 months.", "Babbles, responds to own name and waves bye-bye."]
        },
        b12: {
            label: "1 to 2 years",
            nutrition: ["Move to family foods: roti, rice, dal, vegetables, egg, paneer, fish or chicken, cut small and soft.", "Offer 400–500 ml whole milk/dairy a day (too much milk crowds out iron-rich food); breastfeeding can continue to 2 years.", "Add healthy fats: ghee, nut powder or paste, oil in cooking."],
            food: ["3 meals + 2 small snacks at regular times; avoid grazing and milk bottles between meals.", "Toddlers are picky: keep offering rejected foods calmly 10–15 times without forcing or bribing.", "Avoid whole nuts, whole grapes, popcorn and hard raw carrot (choking), plus juice, sweets and biscuits."],
            health: ["Brush twice daily with a smear of fluoride toothpaste; first dental check by age 1 and no night-time bottles.", "Wash hands before meals and after toilet or play; keep nails short.", "Give iron or vitamin D supplements only if prescribed."],
            checkups: ["12 months: Hepatitis A-1 (and a hemoglobin check).", "15–18 months: MMR-2, varicella, and DTP/Hib/IPV boosters.", "18 months: Hepatitis A-2 and developmental screening."],
            milestones: ["Walks alone by 12–15 months; says a few words by 18 months.", "Points to show things, follows simple instructions, scribbles."]
        },
        b24: {
            label: "2 to 4 years",
            nutrition: ["Plate guide: half vegetables and fruit, a quarter whole grains (roti, millets, brown rice), a quarter protein (dal, egg, paneer, chicken, fish).", "2 cups of milk/curd daily for calcium; include iron foods such as ragi, beetroot and green leaves.", "Choose whole fruit over juice and water over sweet drinks."],
            food: ["Eat together at the table with no TV or phone; keep meals to about 20–30 minutes.", "Let your child serve small portions and choose between two healthy options.", "Don't use sweets or chips as rewards or bribes; keep them for occasional treats."],
            health: ["Brush twice daily with a pea-sized amount of fluoride toothpaste with an adult helping; dental check every 6 months.", "Teach 20-second handwashing; keep up to date on vaccines and ask about deworming.", "Use car seats or child restraints and give constant supervision near water."],
            checkups: ["Check height, weight and BMI-for-age at least every 6 months.", "Annual vision, hearing and anaemia review; yearly influenza shot.", "Typhoid booster and any pending vaccines per your pediatrician."],
            milestones: ["Speaks in 2–3 word sentences by age 2 and full sentences by 3–4.", "Runs, jumps, climbs stairs, starts toilet training and plays with other children."]
        },
        b60: {
            label: "5 to 7 years",
            nutrition: ["Never skip breakfast: protein plus whole grain (egg, besan chilla, idli with sambar, poha with peanuts, oats with milk).", "Build bones with 2–3 servings of dairy/calcium daily (milk, curd, paneer, ragi, sesame) and morning sunlight for vitamin D.", "Pack a healthy lunchbox: roti or rice, a vegetable, protein and a fruit."],
            food: ["Keep fixed times for 3 meals and 2 snacks, and try one new vegetable each week.", "Limit chips, biscuits, instant noodles, sweets and sugary drinks to occasional, not daily.", "Involve your child in washing vegetables, mixing and plating food; children eat what they help prepare."],
            health: ["Brush twice daily and floss once teeth touch; dental check every 6 months.", "Get an annual eye check (especially if squinting or sitting close to screens) and limit screens.", "Teach road safety, personal safety and asking a trusted adult for help."],
            checkups: ["4–6 years: DTP booster-2, MMR-3/varicella-2 and IPV as advised by your pediatrician.", "Yearly height, weight, BMI and blood pressure where available.", "Yearly influenza vaccine and hemoglobin test."],
            milestones: ["Ties shoelaces, hops, catches a ball and draws a person with detail.", "Recognises letters and numbers, follows 3-step instructions, makes friends."]
        },
        b96: {
            label: "8 to 10 years",
            nutrition: ["Needs more protein, iron and calcium for growth spurts: dal, legumes, eggs, milk, paneer, leafy vegetables, nuts and seeds.", "Aim for 5 portions of fruit and vegetables daily, with whole grains and millets over refined flour.", "Girls approaching puberty need extra iron (greens, ragi, dates, meat) with vitamin C foods."],
            food: ["Encourage a protein-rich breakfast and discourage skipping meals or emotional eating.", "Cut down on fried snacks, cold drinks, energy drinks, fast food and packaged sweets; read labels together.", "Talk about food positively; avoid calling foods \"bad\" or commenting on body size."],
            health: ["Teach independent hygiene: daily bath, clean clothes, hair and nail care, brushing twice and handwashing.", "Begin age-appropriate talks about body changes before puberty starts (girls often begin at 8–10).", "Watch posture, keep school bags under 10–15% of body weight and get yearly eye tests."],
            checkups: ["9–14 years: HPV vaccine (girls) as per IAP guidance; 10–12 years: Tdap booster.", "Annual growth check on percentile charts, plus vision, dental and hemoglobin screening.", "Discuss sleep, mood, bullying and screen use at visits."],
            milestones: ["Reads fluently, reasons logically and manages homework with some independence.", "Early puberty signs may appear (growth spurt, body odor, breast buds in girls); ask your doctor if before age 8."]
        }
    };
    function getBand(m) { return m < 6 ? GUIDE.b0 : m < 12 ? GUIDE.b6 : m < 24 ? GUIDE.b12 : m < 60 ? GUIDE.b24 : m < 96 ? GUIDE.b60 : GUIDE.b96; }
    function getNutritionSuggestions(p) {
        const s = getBand(p.ageInMonths).nutrition.slice(), c = p.category || "";
        if (/Lower/.test(c)) s.push("Weight is on the lower side: add energy-dense foods (ghee, nut paste, banana, milk, eggs) and an extra healthy snack.");
        if (/Overweight|Elevated/.test(c)) s.push("Weight is on the higher side: focus on portion balance, more vegetables, no sugary drinks and more active play. Never put a child on a strict diet.");
        if (p.concern === "nutrition") s.unshift("Picky eating is normal: it can take 10–15 gentle tastes before a child accepts a new food.");
        return s;
    }
    function getFoodHabits(p) { return getBand(p.ageInMonths).food; }
    function getHealthTips(p) { return getBand(p.ageInMonths).health; }
    function getCheckups(p) { return getBand(p.ageInMonths).checkups.concat(["Vaccine schedules follow IAP guidance; always confirm dates with your pediatrician."]); }
    function getMilestones(p) { return getBand(p.ageInMonths).milestones.concat(["Every child develops at their own pace; see your doctor if you notice lost skills or no progress."]); }
    function getActivitySuggestions(p) {
        let s;
        if (p.ageInMonths < 12) s = ["Supervised tummy time several times a day and floor play.", "Place toys just out of reach to encourage rolling, reaching and crawling.", "Avoid long periods in bouncers, walkers or car seats when awake."];
        else if (p.ageInMonths < 36) s = ["Aim for 3 hours of movement spread through the day: walking, climbing, dancing, ball play.", "Safe outdoor play daily; let toddlers walk instead of always using a stroller.", "Play together: songs, bubbles, stacking and chasing games."];
        else if (p.years < 6) s = ["Aim for 3 hours of active play daily, including 1 hour of energetic running, jumping and cycling.", "Build indoor obstacle courses with cushions and boxes on rainy days.", "Practice balance and ball skills: hopping, kicking and catching."];
        else s = ["Get 60+ minutes of moderate to vigorous activity daily: cycling, swimming, football, badminton, skipping.", "Add bone and muscle strengthening 3 days a week: climbing, monkey bars, jumping games.", "Plan weekend family outings such as park walks and sports."];
        if (p.activity === "low") s.unshift("Start gently with 15-minute bursts of fun active play and build up week by week.");
        return s;
    }
    function getLifestyleSuggestions(p) {
        const m = p.ageInMonths;
        return [m < 12 ? "Follow a calm bedtime pattern (feed, cuddle, dim lights) and always sleep baby on the back." : "Keep a fixed bedtime and wake time with a calm routine (bath, story, lights low).",
        m < 24 ? "Avoid screens except video calls with family." : "Keep screens to age limits, co-view content and keep them out of bedrooms and meals.",
            "Get outdoor sunlight every day for vitamin D and healthy eyes.", "Praise effort and kindness; never compare your child's size with others.", "Spend daily one-on-one time: talk, read and play together."];
    }
    function getDoctorMessage(p) {
        const c = p.category || "";
        let m = "Visit your pediatrician for routine growth checks and vaccines. ";
        if (/Lower/.test(c)) m += "As weight is in the lower range, ask for a review of feeding, anaemia and possible infections. ";
        if (/Overweight|Elevated/.test(c)) m += "As weight is in the higher range, ask for a gentle lifestyle plan and a blood pressure check. ";
        return m + "See a doctor urgently for: fever with lethargy or rash, trouble breathing, repeated vomiting or diarrhoea with dehydration, refusal to feed or drink, seizures, or loss of previously learned skills.";
    }

    function displayList(elementId, items) {
        const list = document.getElementById(elementId);
        if (!list) return;
        list.innerHTML = "";
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    }

    // ==========================================================================
    // 11. GENERATE WELLNESS REPORT
    // ==========================================================================
    function generateReport(profile) {
        const bmi = calculateBMI(profile.weight, profile.height);
        const classification = evaluatePediatricBMI(bmi, profile.ageInMonths, profile.sex);
        const reference = getGrowthReference(profile);
        const dailyTargets = getDailyTargets(profile.ageInMonths);

        currentProfile = {
            ...profile,
            bmi,
            category: classification.category,
            reference: reference.name
        };

        // Header titles
        document.getElementById("resultTitle").textContent = `${profile.name}'s Wellness Report`;

        // Fixed bug: proper parentheses around sex ternary
        const sexLabel = profile.sex === "boy" ? "Boy 👦" : "Girl 👧";
        document.getElementById("resultSubtitle").textContent =
            `${getBand(profile.ageInMonths).label} · ${profile.years} years, ${profile.months} months · ${sexLabel} · Measured on ${new Date().toLocaleDateString()}`;

        // Growth Status & Visual BMI Gauge
        document.getElementById("growthCategoryName").textContent = classification.category;
        document.getElementById("growthCategoryDesc").textContent = classification.description;

        const badge = document.getElementById("growthBadge");
        badge.textContent = classification.category;
        badge.style.backgroundColor = classification.badgeColor;

        // Visual Needle Pointer
        const needle = document.getElementById("meterNeedle");
        const tooltip = document.getElementById("needleTooltip");
        needle.style.left = `${classification.gaugePercent}%`;
        tooltip.textContent = `BMI: ${bmi}`;

        // 6 Result Metric Cards
        const cards = document.getElementById("resultCards");
        const heightDisplay = profile.unitUsed === "imperial"
            ? `${profile.height} cm (${Math.floor((profile.height / 2.54) / 12)}' ${Math.round(((profile.height / 2.54) % 12) * 10) / 10}")`
            : `${profile.height} cm`;

        const weightDisplay = profile.unitUsed === "imperial"
            ? `${profile.weight} kg (${(profile.weight * 2.20462).toFixed(1)} lbs)`
            : `${profile.weight} kg`;

        cards.innerHTML = `
            <div class="result-card">
                <span>Height / Length</span>
                <strong>${heightDisplay}</strong>
                <small>${profile.measurement === "lying" ? "Recumbent Length" : "Standing Height"}</small>
            </div>

            <div class="result-card">
                <span>Weight</span>
                <strong>${weightDisplay}</strong>
                <small>Entered body weight</small>
            </div>

            <div class="result-card">
                <span>Calculated BMI</span>
                <strong>${bmi}</strong>
                <small>kg/m² · Age-adjusted index</small>
            </div>

            <div class="result-card">
                <span>Growth Standard</span>
                <strong style="font-size: var(--font-lg);">${reference.name.split(' ')[0]} Benchmark</strong>
                <small>${reference.range}</small>
            </div>

            <div class="result-card">
                <span>Activity Profile</span>
                <strong style="font-size: var(--font-lg); text-transform: capitalize;">${profile.activity} Active</strong>
                <small>Parent assessment</small>
            </div>

            <div class="result-card">
                <span>Focus Area</span>
                <strong style="font-size: var(--font-lg); text-transform: capitalize;">${profile.concern}</strong>
                <small>Primary caregiver priority</small>
            </div>
        `;

        // Daily Pediatric Targets Widget
        const targetsGrid = document.getElementById("dailyTargetsGrid");
        targetsGrid.innerHTML = dailyTargets.map(t => `
            <div class="target-card">
                <span class="target-icon">${t.icon}</span>
                <h4>${t.title}</h4>
                <div class="target-value">${t.value}</div>
                <p>${t.note}</p>
            </div>
        `).join("");

        // Reference Note
        document.getElementById("referenceNote").innerHTML = `
            <strong>📚 Clinical Reference Base: ${reference.name}</strong><br>
            ${reference.message}
            <br><br>
            <strong>Pediatric Context:</strong> Unlike adults, a child's BMI naturally shifts as they grow and undergo puberty. 
            BMI in children is evaluated relative to age- and sex-specific growth charts, which is why an age-adjusted benchmark is applied above.
        `;

        // 3 Guidance Lists
        displayList("nutritionList", getNutritionSuggestions(currentProfile));
        displayList("foodList", getFoodHabits(profile));
        displayList("healthList", getHealthTips(profile));
        displayList("checkupList", getCheckups(profile));
        displayList("milestoneList", getMilestones(profile));
        document.getElementById("doctorMessage").textContent = getDoctorMessage(currentProfile);
        displayList("activityList", getActivitySuggestions(profile));
        displayList("lifestyleList", getLifestyleSuggestions(profile));

        // Reveal and Scroll
        results.hidden = false;
        results.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("Report generated successfully!", "success");
    }

    // ==========================================================================
    // 12. FORM SUBMISSION
    // ==========================================================================
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const profile = getProfile();
        if (!profile) return;
        generateReport(profile);
    });

    // ==========================================================================
    // 13. STORAGE & HISTORY MANAGEMENT
    // ==========================================================================
    function getHistory() {
        try {
            const data = JSON.parse(localStorage.getItem("fitsphereHistory") || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function saveHistory(history) {
        try {
            localStorage.setItem("fitsphereHistory", JSON.stringify(history));
            return true;
        } catch (e) {
            showToast("Unable to save. Storage might be full or blocked.", "error");
            return false;
        }
    }

    // Save Button
    document.getElementById("saveBtn").addEventListener("click", function () {
        if (!currentProfile) return;

        const history = getHistory();
        const record = {
            ...currentProfile,
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        history.push(record);

        if (saveHistory(history)) {
            showToast(`Saved measurement for ${record.name}!`, "success");
            displayHistory();
        }
    });

    // Display Saved History
    function displayHistory() {
        const history = getHistory();
        const container = document.getElementById("historyList");
        const countPill = document.getElementById("historyCount");

        if (countPill) {
            countPill.textContent = `${history.length} measurement${history.length === 1 ? '' : 's'} saved`;
        }

        container.innerHTML = "";

        if (history.length === 0) {
            container.innerHTML = `
                <p class="empty-history">
                    🌱 No saved measurements yet. Complete an assessment above and click "Save to Growth History".
                </p>
            `;
            return;
        }

        // Show newest records first
        history.slice().reverse().forEach(record => {
            const item = document.createElement("div");
            item.className = "history-item";

            const mainInfo = document.createElement("div");
            mainInfo.className = "history-main";

            const heading = document.createElement("h4");
            const categoryBadge = record.category ? `<span class="history-cat-badge" style="background:#198754;">${record.category}</span>` : "";
            heading.innerHTML = `${record.name} ${categoryBadge}`;

            const desc = document.createElement("p");
            desc.className = "history-desc";
            desc.innerHTML = `
                📅 <strong>${record.date}</strong> · 
                ${record.years}y ${record.months}m · 
                ${record.sex === "boy" ? "Boy 👦" : "Girl 👧"} · 
                Height: <strong>${record.height} cm</strong> · 
                Weight: <strong>${record.weight} kg</strong> · 
                BMI: <strong>${record.bmi}</strong>
            `;

            mainInfo.appendChild(heading);
            mainInfo.appendChild(desc);

            // Action Buttons (Load into form, Delete)
            const actions = document.createElement("div");
            actions.className = "history-actions";

            const loadBtn = document.createElement("button");
            loadBtn.className = "history-load-btn";
            loadBtn.type = "button";
            loadBtn.textContent = "⚡ Load Profile";
            loadBtn.title = "Populate assessment form with these measurements";
            loadBtn.addEventListener("click", () => {
                loadProfileIntoForm(record);
            });

            const delBtn = document.createElement("button");
            delBtn.className = "history-del-btn";
            delBtn.type = "button";
            delBtn.textContent = "Delete";
            delBtn.title = "Delete this measurement record";
            delBtn.addEventListener("click", () => {
                deleteRecord(record.id);
            });

            actions.appendChild(loadBtn);
            actions.appendChild(delBtn);

            item.appendChild(mainInfo);
            item.appendChild(actions);

            container.appendChild(item);
        });
    }

    function loadProfileIntoForm(record) {
        childNameInput.value = record.name;
        ageYearsInput.value = record.years;
        ageMonthsInput.value = record.months;

        const sexRadio = document.querySelector(`input[name="sex"][value="${record.sex}"]`);
        if (sexRadio) sexRadio.checked = true;

        if (currentUnit === "metric") {
            heightInput.value = record.height;
            weightInput.value = record.weight;
        } else {
            const totalInches = record.height / 2.54;
            heightFtInput.value = Math.floor(totalInches / 12);
            heightInInput.value = Math.round((totalInches % 12) * 10) / 10;
            weightLbsInput.value = (record.weight * 2.20462).toFixed(1);
        }

        if (record.measurement) measurementSelect.value = record.measurement;
        if (record.activity) activitySelect.value = record.activity;
        if (record.concern) concernSelect.value = record.concern;

        showToast(`Loaded ${record.name}'s profile into form!`, "info");
        document.getElementById("assessment").scrollIntoView({ behavior: "smooth" });
    }

    function deleteRecord(id) {
        const history = getHistory().filter(item => item.id !== id);
        saveHistory(history);
        showToast("Record deleted.", "info");
        displayHistory();
    }

    // Clear All Records
    document.getElementById("clearHistoryBtn").addEventListener("click", function () {
        const history = getHistory();
        if (history.length === 0) {
            showToast("History is already empty.", "info");
            return;
        }
        if (confirm("Are you sure you want to clear all saved child growth records?")) {
            localStorage.removeItem("fitsphereHistory");
            showToast("All growth history cleared.", "info");
            displayHistory();
        }
    });

    // ==========================================================================
    // 14. EXPORT TO CSV / EXCEL SPREADSHEET
    // ==========================================================================
    function exportToCSV(records, filename = "fitsphere-growth-records.csv") {
        if (!records || records.length === 0) {
            showToast("No records available to export.", "error");
            return;
        }

        const headers = ["Child Name", "Date", "Age (Years)", "Age (Months)", "Sex", "Height (cm)", "Weight (kg)", "Calculated BMI", "Category", "Measurement Type", "Activity Level"];

        const rows = records.map(r => [
            `"${r.name.replace(/"/g, '""')}"`,
            `"${r.date || ''}"`,
            r.years,
            r.months,
            `"${r.sex}"`,
            r.height,
            r.weight,
            r.bmi,
            `"${r.category || ''}"`,
            `"${r.measurement || ''}"`,
            `"${r.activity || ''}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Exported spreadsheet successfully!", "success");
    }

    document.getElementById("exportHistoryBtn").addEventListener("click", function () {
        const history = getHistory();
        exportToCSV(history, "FitSphere-All-Child-Records.csv");
    });

    const exportSingleBtn = document.getElementById("exportSingleBtn");
    if (exportSingleBtn) {
        exportSingleBtn.addEventListener("click", function () {
            if (!currentProfile) return;
            const single = [{
                ...currentProfile,
                date: new Date().toLocaleDateString()
            }];
            exportToCSV(single, `${currentProfile.name}-Wellness-Report.csv`);
        });
    }

    // ==========================================================================
    // 15. PRINT & NEW ASSESSMENT
    // ==========================================================================
    document.getElementById("printBtn").addEventListener("click", function () {
        window.print();
    });

    document.getElementById("newBtn").addEventListener("click", function () {
        form.reset();
        currentProfile = null;
        results.hidden = true;
        document.getElementById("assessment").scrollIntoView({ behavior: "smooth" });
        showToast("Form reset. Ready for new assessment.", "info");
    });

    // ==========================================================================
    // 16. FLOATING BACK TO TOP BUTTON
    // ==========================================================================
    window.addEventListener("scroll", function () {
        if (window.scrollY > 350) {
            backToTopBtn.classList.add("show");
        } else {
            backToTopBtn.classList.remove("show");
        }
    });

    backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ==========================================================================
    // 17. LANGUAGE / i18n SYSTEM
    // ==========================================================================
    const TRANSLATIONS = {
        en: {
            nav_home: "Home", nav_features: "Features", nav_assessment: "Assessment", nav_history: "Growth History",
            nav_home_mobile: "🏠 Home", nav_features_mobile: "✨ Features", nav_assessment_mobile: "📋 Assessment", nav_history_mobile: "📈 Growth History",
            nav_getstarted: "Get Started ↗", mobile_cta: "Start Child Assessment →",
            hero_eyebrow: "✦ HEALTHY CHILDREN, HAPPIER FUTURE",
            hero_title: 'Every child deserves<br>a <span>healthy start.</span>',
            hero_desc: "Made for children aged 0 to 10 years. Understand your child's growth, discover healthy nutrition habits, and explore personalized pediatric wellness guidance with FitSphere.",
            hero_cta: "Start Assessment →", hero_explore: "Explore Features",
            stat_years: "Years supported", stat_private: "Private & browser-based", stat_bench: "Growth benchmarks",
            features_eyebrow: "WHAT WE OFFER", features_title: "A healthier journey starts here.",
            features_desc: "Everything parents and caregivers need to understand and nurture childhood growth.",
            feat_growth_title: "Growth Insights", feat_growth_desc: "Monitor height, weight, and BMI percentiles with international WHO and IAP growth references.",
            feat_nutrition_title: "Smart Nutrition", feat_nutrition_desc: "Discover age-tailored meal ideas, balanced food groups, hydration, and healthy eating routines.",
            feat_activity_title: "Physical Activities", feat_activity_desc: "Find age-appropriate movement routines, outdoor games, and motor skills play guidelines.",
            feat_sleep_title: "Sleep & Daily Targets", feat_sleep_desc: "Get exact sleep hours, hydration goals, and screen time balance recommendations for your child's age.",
            assess_eyebrow: "PERSONALIZED WELLNESS", assess_title: "Let's understand your child's growth.",
            assess_desc: "Enter a few quick details to generate a comprehensive, personalized pediatric wellness report.",
            form_submit: "Generate Wellness Report →",
            form_privacy: '🔒 <strong>100% Private:</strong> Your child\'s data is processed locally and stays right inside your browser.',
            history_eyebrow: "PROGRESS TRACKER", history_title: "Saved Growth History",
            history_desc: "Review past measurements and track your child's progress over time.",
            footer_tagline: "Helping families nurture healthier, happier habits for children everywhere.",
            footer_copy: "© 2026 FitSphere Platform. For educational and wellness guidance only. Not a medical diagnostic tool."
        },
        hi: {
            nav_home: "होम", nav_features: "विशेषताएँ", nav_assessment: "मूल्यांकन", nav_history: "विकास इतिहास",
            nav_home_mobile: "🏠 होम", nav_features_mobile: "✨ विशेषताएँ", nav_assessment_mobile: "📋 मूल्यांकन", nav_history_mobile: "📈 विकास इतिहास",
            nav_getstarted: "शुरू करें ↗", mobile_cta: "बच्चे का मूल्यांकन शुरू करें →",
            hero_eyebrow: "✦ स्वस्थ बच्चे, सुखद भविष्य",
            hero_title: 'हर बच्चे को मिलनी चाहिए<br>एक <span>स्वस्थ शुरुआत।</span>',
            hero_desc: "0 से 10 साल के बच्चों के लिए बनाया गया। अपने बच्चे के विकास को समझें, स्वस्थ पोषण की आदतें खोजें, और FitSphere के साथ व्यक्तिगत बाल कल्याण मार्गदर्शन प्राप्त करें।",
            hero_cta: "मूल्यांकन शुरू करें →", hero_explore: "विशेषताएँ देखें",
            stat_years: "वर्ष समर्थित", stat_private: "निजी और ब्राउज़र-आधारित", stat_bench: "विकास मानदंड",
            features_eyebrow: "हम क्या प्रदान करते हैं", features_title: "एक स्वस्थ यात्रा यहाँ से शुरू होती है।",
            features_desc: "बचपन के विकास को समझने और पोषित करने के लिए माता-पिता और देखभालकर्ताओं के लिए सब कुछ।",
            feat_growth_title: "विकास अंतर्दृष्टि", feat_growth_desc: "अंतर्राष्ट्रीय WHO और IAP विकास संदर्भों के साथ ऊँचाई, वजन और BMI प्रतिशतक की निगरानी करें।",
            feat_nutrition_title: "स्मार्ट पोषण", feat_nutrition_desc: "उम्र के अनुसार भोजन के विचार, संतुलित खाद्य समूह, जलयोजन और स्वस्थ खाने की दिनचर्या खोजें।",
            feat_activity_title: "शारीरिक गतिविधियाँ", feat_activity_desc: "उम्र-उपयुक्त गतिविधि दिनचर्या, बाहरी खेल और मोटर कौशल खेल दिशानिर्देश खोजें।",
            feat_sleep_title: "नींद और दैनिक लक्ष्य", feat_sleep_desc: "अपने बच्चे की उम्र के लिए सटीक नींद के घंटे, जलयोजन लक्ष्य और स्क्रीन टाइम संतुलन सिफारिशें प्राप्त करें।",
            assess_eyebrow: "व्यक्तिगत कल्याण", assess_title: "आइए आपके बच्चे के विकास को समझें।",
            assess_desc: "एक व्यापक, व्यक्तिगत बाल कल्याण रिपोर्ट तैयार करने के लिए कुछ त्वरित विवरण दर्ज करें।",
            form_submit: "कल्याण रिपोर्ट बनाएं →",
            form_privacy: '🔒 <strong>100% निजी:</strong> आपके बच्चे का डेटा स्थानीय रूप से संसाधित होता है और आपके ब्राउज़र में ही रहता है।',
            history_eyebrow: "प्रगति ट्रैकर", history_title: "सहेजा गया विकास इतिहास",
            history_desc: "पिछले माप की समीक्षा करें और समय के साथ अपने बच्चे की प्रगति को ट्रैक करें।",
            footer_tagline: "हर जगह बच्चों के लिए स्वस्थ, खुशहाल आदतों को पोषित करने में परिवारों की मदद करना।",
            footer_copy: "© 2026 FitSphere प्लेटफ़ॉर्म। केवल शैक्षिक और कल्याण मार्गदर्शन के लिए। चिकित्सा निदान उपकरण नहीं।"
        },
        ta: {
            nav_home: "முகப்பு", nav_features: "அம்சங்கள்", nav_assessment: "மதிப்பீடு", nav_history: "வளர்ச்சி வரலாறு",
            nav_home_mobile: "🏠 முகப்பு", nav_features_mobile: "✨ அம்சங்கள்", nav_assessment_mobile: "📋 மதிப்பீடு", nav_history_mobile: "📈 வளர்ச்சி வரலாறு",
            nav_getstarted: "தொடங்கு ↗", mobile_cta: "குழந்தை மதிப்பீட்டைத் தொடங்கு →",
            hero_eyebrow: "✦ ஆரோக்கியமான குழந்தைகள், மகிழ்ச்சியான எதிர்காலம்",
            hero_title: 'ஒவ்வொரு குழந்தையும்<br>ஒரு <span>ஆரோக்கியமான தொடக்கத்திற்கு</span> தகுதியானவர்.',
            hero_desc: "0 முதல் 10 வயது குழந்தைகளுக்காக உருவாக்கப்பட்டது. உங்கள் குழந்தையின் வளர்ச்சியைப் புரிந்துகொள்ளுங்கள், ஆரோக்கியமான ஊட்டச்சத்து பழக்கங்களைக் கண்டறியுங்கள்.",
            hero_cta: "மதிப்பீட்டைத் தொடங்கு →", hero_explore: "அம்சங்களை ஆராயுங்கள்",
            stat_years: "ஆண்டுகள் ஆதரிக்கப்படுகின்றன", stat_private: "தனிப்பட்ட & உலாவி-அடிப்படை", stat_bench: "வளர்ச்சி அளவுகோல்கள்",
            features_eyebrow: "நாங்கள் வழங்குவது", features_title: "ஆரோக்கியமான பயணம் இங்கே தொடங்குகிறது.",
            features_desc: "குழந்தை பருவ வளர்ச்சியைப் புரிந்துகொண்டு வளர்க்க பெற்றோர் மற்றும் பராமரிப்பாளர்களுக்கு தேவையான அனைத்தும்.",
            feat_growth_title: "வளர்ச்சி நுண்ணறிவுகள்", feat_growth_desc: "சர்வதேச WHO மற்றும் IAP வளர்ச்சி குறிப்புகளுடன் உயரம், எடை மற்றும் BMI சதவீதங்களைக் கண்காணிக்கவும்.",
            feat_nutrition_title: "ஸ்மார்ட் ஊட்டச்சத்து", feat_nutrition_desc: "வயதுக்கேற்ற உணவு யோசனைகள், சமச்சீர் உணவு குழுக்கள், நீரேற்றம் மற்றும் ஆரோக்கியமான உணவு வழக்கங்களைக் கண்டறியுங்கள்.",
            feat_activity_title: "உடல் செயல்பாடுகள்", feat_activity_desc: "வயதுக்கேற்ற இயக்க வழக்கங்கள், வெளிப்புற விளையாட்டுகள் மற்றும் மோட்டார் திறன் வழிகாட்டுதல்களைக் கண்டறியுங்கள்.",
            feat_sleep_title: "தூக்கம் & தினசரி இலக்குகள்", feat_sleep_desc: "உங்கள் குழந்தையின் வயதுக்கான சரியான தூக்க நேரம், நீரேற்ற இலக்குகள் மற்றும் திரை நேர பரிந்துரைகளைப் பெறுங்கள்.",
            assess_eyebrow: "தனிப்பயனாக்கப்பட்ட நலன்", assess_title: "உங்கள் குழந்தையின் வளர்ச்சியைப் புரிந்துகொள்வோம்.",
            assess_desc: "ஒரு விரிவான, தனிப்பயனாக்கப்பட்ட குழந்தை நல அறிக்கையை உருவாக்க சில விவரங்களை உள்ளிடவும்.",
            form_submit: "நல அறிக்கையை உருவாக்கு →",
            form_privacy: '🔒 <strong>100% தனிப்பட்டது:</strong> உங்கள் குழந்தையின் தரவு உள்ளூரில் செயலாக்கப்பட்டு உங்கள் உலாவியில் இருக்கும்.',
            history_eyebrow: "முன்னேற்ற கண்காணிப்பான்", history_title: "சேமிக்கப்பட்ட வளர்ச்சி வரலாறு",
            history_desc: "கடந்த அளவீடுகளை மதிப்பாய்வு செய்து உங்கள் குழந்தையின் முன்னேற்றத்தைக் கண்காணிக்கவும்.",
            footer_tagline: "எல்லா இடங்களிலும் குழந்தைகளுக்கு ஆரோக்கியமான, மகிழ்ச்சியான பழக்கங்களை வளர்க்க குடும்பங்களுக்கு உதவுகிறது.",
            footer_copy: "© 2026 FitSphere தளம். கல்வி மற்றும் நல வழிகாட்டுதலுக்கு மட்டும். மருத்துவ கண்டறிதல் கருவி அல்ல."
        },
        te: {
            nav_home: "హోమ్", nav_features: "ఫీచర్లు", nav_assessment: "అంచనా", nav_history: "పెరుగుదల చరిత్ర",
            nav_home_mobile: "🏠 హోమ్", nav_features_mobile: "✨ ఫీచర్లు", nav_assessment_mobile: "📋 అంచనా", nav_history_mobile: "📈 పెరుగుదల చరిత్ర",
            nav_getstarted: "ప్రారంభించండి ↗", mobile_cta: "పిల్లల అంచనా ప్రారంభించండి →",
            hero_eyebrow: "✦ ఆరోగ్యకరమైన పిల్లలు, సంతోషకరమైన భవిష్యత్తు",
            hero_title: 'ప్రతి పిల్లవాడు<br>ఒక <span>ఆరోగ్యకరమైన ప్రారంభానికి</span> అర్హుడు.',
            hero_desc: "0 నుండి 10 సంవత్సరాల పిల్లల కోసం రూపొందించబడింది. మీ పిల్లల పెరుగుదలను అర్థం చేసుకోండి, ఆరోగ్యకరమైన పోషకాహార అలవాట్లను కనుగొనండి.",
            hero_cta: "అంచనా ప్రారంభించండి →", hero_explore: "ఫీచర్లను అన్వేషించండి",
            stat_years: "సంవత్సరాలు మద్దతు", stat_private: "ప్రైవేట్ & బ్రౌజర్ ఆధారిత", stat_bench: "పెరుగుదల ప్రమాణాలు",
            features_eyebrow: "మేము అందించేది", features_title: "ఆరోగ్యకరమైన ప్రయాణం ఇక్కడ ప్రారంభమవుతుంది.",
            features_desc: "బాల్యంలో పెరుగుదలను అర్థం చేసుకోవడానికి మరియు పెంచడానికి తల్లిదండ్రులు మరియు సంరక్షకులకు అవసరమైన ప్రతిదీ.",
            feat_growth_title: "పెరుగుదల అంతర్దృష్టులు", feat_growth_desc: "అంతర్జాతీయ WHO మరియు IAP పెరుగుదల సూచనలతో ఎత్తు, బరువు మరియు BMI శాతాలను పర్యవేక్షించండి.",
            feat_nutrition_title: "స్మార్ట్ పోషణ", feat_nutrition_desc: "వయసుకు తగిన భోజన ఆలోచనలు, సమతుల ఆహార సమూహాలు, హైడ్రేషన్ మరియు ఆరోగ్యకరమైన తినే అలవాట్లను కనుగొనండి.",
            feat_activity_title: "శారీరక కార్యకలాపాలు", feat_activity_desc: "వయసుకు తగిన కదలిక దినచర్యలు, బయటి ఆటలు మరియు మోటార్ నైపుణ్య మార్గదర్శకాలను కనుగొనండి.",
            feat_sleep_title: "నిద్ర & రోజువారీ లక్ష్యాలు", feat_sleep_desc: "మీ పిల్లల వయసుకు ఖచ్చితమైన నిద్ర గంటలు, హైడ్రేషన్ లక్ష్యాలు మరియు స్క్రీన్ టైమ్ సిఫార్సులను పొందండి.",
            assess_eyebrow: "వ్యక్తిగతీకరించిన సంక్షేమం", assess_title: "మీ పిల్లల పెరుగుదలను అర్థం చేసుకుందాం.",
            assess_desc: "సమగ్ర, వ్యక్తిగతీకరించిన శిశు సంక్షేమ నివేదికను రూపొందించడానికి కొన్ని వివరాలను నమోదు చేయండి.",
            form_submit: "సంక్షేమ నివేదికను రూపొందించండి →",
            form_privacy: '🔒 <strong>100% ప్రైవేట్:</strong> మీ పిల్లల డేటా స్థానికంగా ప్రాసెస్ చేయబడుతుంది మరియు మీ బ్రౌజర్‌లోనే ఉంటుంది.',
            history_eyebrow: "పురోగతి ట్రాకర్", history_title: "సేవ్ చేసిన పెరుగుదల చరిత్ర",
            history_desc: "గత కొలతలను సమీక్షించండి మరియు కాలక్రమంలో మీ పిల్లల పురోగతిని ట్రాక్ చేయండి.",
            footer_tagline: "ప్రతిచోటా పిల్లల కోసం ఆరోగ్యకరమైన, సంతోషకరమైన అలవాట్లను పెంపొందించడంలో కుటుంబాలకు సహాయం చేయడం.",
            footer_copy: "© 2026 FitSphere ప్లాట్‌ఫారమ్. విద్యా మరియు సంక్షేమ మార్గదర్శకత్వం కోసం మాత్రమే. వైద్య నిర్ధారణ సాధనం కాదు."
        },
        es: {
            nav_home: "Inicio", nav_features: "Funciones", nav_assessment: "Evaluación", nav_history: "Historial de Crecimiento",
            nav_home_mobile: "🏠 Inicio", nav_features_mobile: "✨ Funciones", nav_assessment_mobile: "📋 Evaluación", nav_history_mobile: "📈 Historial",
            nav_getstarted: "Comenzar ↗", mobile_cta: "Iniciar Evaluación Infantil →",
            hero_eyebrow: "✦ NIÑOS SANOS, FUTURO MÁS FELIZ",
            hero_title: 'Cada niño merece<br>un <span>comienzo saludable.</span>',
            hero_desc: "Diseñado para niños de 0 a 10 años. Comprende el crecimiento de tu hijo, descubre hábitos nutricionales saludables y explora orientación pediátrica personalizada con FitSphere.",
            hero_cta: "Iniciar Evaluación →", hero_explore: "Explorar Funciones",
            stat_years: "Años soportados", stat_private: "Privado y en navegador", stat_bench: "Referencias de crecimiento",
            features_eyebrow: "LO QUE OFRECEMOS", features_title: "Un viaje más saludable comienza aquí.",
            features_desc: "Todo lo que los padres y cuidadores necesitan para comprender y nutrir el crecimiento infantil.",
            feat_growth_title: "Análisis de Crecimiento", feat_growth_desc: "Monitorea percentiles de altura, peso e IMC con referencias internacionales de crecimiento WHO e IAP.",
            feat_nutrition_title: "Nutrición Inteligente", feat_nutrition_desc: "Descubre ideas de comidas adaptadas a la edad, grupos alimenticios equilibrados, hidratación y rutinas de alimentación saludable.",
            feat_activity_title: "Actividades Físicas", feat_activity_desc: "Encuentra rutinas de movimiento apropiadas para la edad, juegos al aire libre y guías de habilidades motoras.",
            feat_sleep_title: "Sueño y Metas Diarias", feat_sleep_desc: "Obtén horas exactas de sueño, metas de hidratación y recomendaciones de tiempo de pantalla para la edad de tu hijo.",
            assess_eyebrow: "BIENESTAR PERSONALIZADO", assess_title: "Entendamos el crecimiento de tu hijo.",
            assess_desc: "Ingresa algunos datos rápidos para generar un informe integral y personalizado de bienestar pediátrico.",
            form_submit: "Generar Informe de Bienestar →",
            form_privacy: '🔒 <strong>100% Privado:</strong> Los datos de tu hijo se procesan localmente y permanecen en tu navegador.',
            history_eyebrow: "SEGUIMIENTO DE PROGRESO", history_title: "Historial de Crecimiento Guardado",
            history_desc: "Revisa mediciones anteriores y sigue el progreso de tu hijo a lo largo del tiempo.",
            footer_tagline: "Ayudando a las familias a nutrir hábitos más saludables y felices para los niños en todas partes.",
            footer_copy: "© 2026 Plataforma FitSphere. Solo para orientación educativa y de bienestar. No es una herramienta de diagnóstico médico."
        }
    };

    // Extend all language objects with the extra keys
    const EXTRA_KEYS = {
        en: {
            form_title: "Child's Profile", form_subtitle: "Fill in details to generate a personalized pediatric wellness report.",
            unit_label: "Units:", unit_metric: "Metric (cm, kg)", unit_imperial: "Imperial (ft/in, lbs)",
            label_child_name: "Child's Name", label_age_years: "Age in Years", label_age_months: "Additional Months",
            label_sex: "Sex (for pediatric growth standards)", opt_boy: "👦 Boy", opt_girl: "👧 Girl",
            label_height_cm: "Height / Length (cm)", hint_height_cm: "Range: 30 to 150 cm",
            label_weight_kg: "Weight (kg)", hint_weight_kg: "Range: 1 to 60 kg",
            label_height_ft: "Height (Feet)", label_height_in: "Height (Inches)",
            label_weight_lbs: "Weight (Pounds / lbs)", hint_weight_lbs: "Range: 2 to 132 lbs",
            label_measurement: "How was height / length measured?", label_activity: "Current Daily Activity Level",
            label_concern: "Primary Wellness Focus",
            side_title: "Every child grows at their own pace.",
            side_desc: "Growth is influenced by genetics, nutrition, physical activity, and sleep. A single measurement is just one chapter of their continuous growth story.",
            side_includes_title: "What your report includes:",
            side_inc_1: "✓ Age-adjusted pediatric BMI calculation", side_inc_2: "✓ Visual WHO & IAP Growth Gauge",
            side_inc_3: "✓ Daily Sleep, Hydration & Screen targets", side_inc_4: "✓ Food habits & nutrition for your child's age",
            side_inc_5: "✓ Health-care tips, check-ups & vaccine reminders", side_inc_6: "✓ Developmental milestones to watch",
            side_inc_7: "✓ Active play & physical recommendations", side_inc_8: "✓ Save, print, and export growth history",
            safety_title: "👩‍⚕️ Important Pediatric Note",
            safety_desc: "FitSphere provides educational wellness information and is not a substitute for professional medical diagnosis. Always consult your pediatrician for individual clinical guidance.",
            report_eyebrow: "YOUR CHILD'S PERSONALIZED REPORT", report_title: "Growth & Wellness Insights",
            gauge_tag: "PEDIATRIC GROWTH CLASSIFICATION",
            seg_under: "Underweight", seg_healthy: "Healthy Weight", seg_risk: "Overweight Risk", seg_high: "Higher Range",
            meter_lower: "Lower Range", meter_ideal: "Ideal Growth Window", meter_higher: "Higher Range",
            targets_eyebrow: "RECOMMENDED DAILY BENCHMARKS", targets_title: "Age-Appropriate Daily Targets",
            targets_desc: "Evidence-based pediatric guidelines from WHO and the American Academy of Pediatrics (AAP).",
            rec_nutrition_title: "Nutrition Essentials", rec_food_title: "Food Habits", rec_health_title: "Health Care Tips",
            rec_checkup_title: "Check-ups & Vaccines", rec_milestone_title: "Milestones to Watch",
            rec_activity_title: "Active Play & Fitness", rec_lifestyle_title: "Healthy Daily Routines",
            doctor_note_title: "👩‍⚕️ When to Consult a Pediatrician",
            btn_save: "💾 Save to Growth History", btn_print: "🖨️ Print / Save as PDF",
            btn_export_single: "📥 Export Report (CSV)", btn_new: "🔄 New Assessment",
            btn_export_all: "📥 Export All Records", btn_clear_all: "🗑️ Clear All",
            empty_history: "No saved measurements yet. Complete an assessment above and click \"Save to Growth History\"."
        },
        hi: {
            form_title: "बच्चे की प्रोफ़ाइल", form_subtitle: "व्यक्तिगत बाल कल्याण रिपोर्ट बनाने के लिए विवरण भरें।",
            unit_label: "इकाइयाँ:", unit_metric: "मेट्रिक (cm, kg)", unit_imperial: "इम्पीरियल (ft/in, lbs)",
            label_child_name: "बच्चे का नाम", label_age_years: "आयु (वर्षों में)", label_age_months: "अतिरिक्त महीने",
            label_sex: "लिंग (बाल विकास मानकों के लिए)", opt_boy: "👦 लड़का", opt_girl: "👧 लड़की",
            label_height_cm: "ऊँचाई / लंबाई (cm)", hint_height_cm: "सीमा: 30 से 150 cm",
            label_weight_kg: "वजन (kg)", hint_weight_kg: "सीमा: 1 से 60 kg",
            label_height_ft: "ऊँचाई (फीट)", label_height_in: "ऊँचाई (इंच)",
            label_weight_lbs: "वजन (पाउंड)", hint_weight_lbs: "सीमा: 2 से 132 lbs",
            label_measurement: "ऊँचाई / लंबाई कैसे मापी गई?", label_activity: "वर्तमान दैनिक गतिविधि स्तर",
            label_concern: "प्राथमिक कल्याण फोकस",
            side_title: "प्रत्येक बच्चा अपनी गति से बढ़ता है।",
            side_desc: "विकास आनुवंशिकता, पोषण, शारीरिक गतिविधि और नींद से प्रभावित होता है।",
            side_includes_title: "आपकी रिपोर्ट में शामिल है:",
            side_inc_1: "✓ आयु-समायोजित बाल BMI गणना", side_inc_2: "✓ दृश्य WHO & IAP विकास गेज",
            side_inc_3: "✓ दैनिक नींद, जलयोजन & स्क्रीन लक्ष्य", side_inc_4: "✓ आपके बच्चे की उम्र के लिए पोषण",
            side_inc_5: "✓ स्वास्थ्य सुझाव, जाँच & टीकाकरण अनुस्मारक", side_inc_6: "✓ विकासात्मक मील के पत्थर",
            side_inc_7: "✓ सक्रिय खेल सिफारिशें", side_inc_8: "✓ विकास इतिहास सहेजें, प्रिंट करें",
            safety_title: "👩‍⚕️ महत्वपूर्ण बाल चिकित्सा नोट",
            safety_desc: "FitSphere शैक्षिक कल्याण जानकारी प्रदान करता है और पेशेवर चिकित्सा निदान का विकल्प नहीं है।",
            report_eyebrow: "आपके बच्चे की व्यक्तिगत रिपोर्ट", report_title: "विकास & कल्याण अंतर्दृष्टि",
            gauge_tag: "बाल विकास वर्गीकरण",
            seg_under: "कम वजन", seg_healthy: "स्वस्थ वजन", seg_risk: "अधिक वजन जोखिम", seg_high: "उच्च श्रेणी",
            meter_lower: "निम्न श्रेणी", meter_ideal: "आदर्श विकास खिड़की", meter_higher: "उच्च श्रेणी",
            targets_eyebrow: "अनुशंसित दैनिक बेंचमार्क", targets_title: "आयु-उपयुक्त दैनिक लक्ष्य",
            targets_desc: "WHO और अमेरिकन अकादमी ऑफ पीडियाट्रिक्स (AAP) से साक्ष्य-आधारित बाल दिशानिर्देश।",
            rec_nutrition_title: "पोषण आवश्यकताएं", rec_food_title: "खान-पान की आदतें", rec_health_title: "स्वास्थ्य देखभाल सुझाव",
            rec_checkup_title: "जाँच & टीके", rec_milestone_title: "देखने योग्य मील के पत्थर",
            rec_activity_title: "सक्रिय खेल & फिटनेस", rec_lifestyle_title: "स्वस्थ दैनिक दिनचर्या",
            doctor_note_title: "👩‍⚕️ बाल रोग विशेषज्ञ से कब परामर्श करें",
            btn_save: "💾 विकास इतिहास में सहेजें", btn_print: "🖨️ प्रिंट / PDF के रूप में सहेजें",
            btn_export_single: "📥 रिपोर्ट निर्यात (CSV)", btn_new: "🔄 नया मूल्यांकन",
            btn_export_all: "📥 सभी रिकॉर्ड निर्यात करें", btn_clear_all: "🗑️ सभी साफ़ करें",
            empty_history: "अभी तक कोई सहेजा गया माप नहीं। ऊपर मूल्यांकन पूरा करें और \"विकास इतिहास में सहेजें\" पर क्लिक करें।"
        },
        ta: {
            form_title: "குழந்தையின் சுயவிவரம்", form_subtitle: "தனிப்பயனாக்கப்பட்ட குழந்தை நல அறிக்கையை உருவாக்க விவரங்களை நிரப்பவும்।",
            unit_label: "அலகுகள்:", unit_metric: "மெட்ரிக் (cm, kg)", unit_imperial: "இம்பீரியல் (ft/in, lbs)",
            label_child_name: "குழந்தையின் பெயர்", label_age_years: "வயது (ஆண்டுகளில்)", label_age_months: "கூடுதல் மாதங்கள்",
            label_sex: "பாலினம் (வளர்ச்சி தரநிலைகளுக்கு)", opt_boy: "👦 சிறுவன்", opt_girl: "👧 சிறுமி",
            label_height_cm: "உயரம் / நீளம் (cm)", hint_height_cm: "வரம்பு: 30 முதல் 150 cm",
            label_weight_kg: "எடை (kg)", hint_weight_kg: "வரம்பு: 1 முதல் 60 kg",
            label_height_ft: "உயரம் (அடி)", label_height_in: "உயரம் (இஞ்சி)",
            label_weight_lbs: "எடை (பவுண்டு)", hint_weight_lbs: "வரம்பு: 2 முதல் 132 lbs",
            label_measurement: "உயரம் / நீளம் எப்படி அளவிடப்பட்டது?", label_activity: "தற்போதைய தினசரி செயல்பாட்டு நிலை",
            label_concern: "முதன்மை நலன் கவனம்",
            side_title: "ஒவ்வொரு குழந்தையும் தனது சொந்த வேகத்தில் வளர்கிறது.",
            side_desc: "வளர்ச்சி மரபணு, ஊட்டச்சத்து, உடல் செயல்பாடு மற்றும் தூக்கத்தால் பாதிக்கப்படுகிறது.",
            side_includes_title: "உங்கள் அறிக்கையில் அடங்கியுள்ளது:",
            side_inc_1: "✓ வயது சரிசெய்யப்பட்ட குழந்தை BMI கணக்கீடு", side_inc_2: "✓ காட்சி WHO & IAP வளர்ச்சி அளவி",
            side_inc_3: "✓ தினசரி தூக்கம், நீரேற்றம் & திரை இலக்குகள்", side_inc_4: "✓ உங்கள் குழந்தையின் வயதுக்கான ஊட்டச்சத்து",
            side_inc_5: "✓ சுகாதார குறிப்புகள் & தடுப்பூசி நினைவூட்டல்கள்", side_inc_6: "✓ வளர்ச்சி மைல்கற்கள்",
            side_inc_7: "✓ செயலில் விளையாட்டு பரிந்துரைகள்", side_inc_8: "✓ வளர்ச்சி வரலாற்றை சேமி, அச்சிடு",
            safety_title: "👩‍⚕️ முக்கியமான குழந்தை மருத்துவ குறிப்பு",
            safety_desc: "FitSphere கல்வி நல தகவல்களை வழங்குகிறது மற்றும் தொழில்முறை மருத்துவ கண்டறிதலுக்கு மாற்றாக இல்லை.",
            report_eyebrow: "உங்கள் குழந்தையின் தனிப்பயன் அறிக்கை", report_title: "வளர்ச்சி & நல நுண்ணறிவுகள்",
            gauge_tag: "குழந்தை வளர்ச்சி வகைப்பாடு",
            seg_under: "குறைந்த எடை", seg_healthy: "ஆரோக்கியமான எடை", seg_risk: "அதிக எடை அபாயம்", seg_high: "உயர் வரம்பு",
            meter_lower: "குறைந்த வரம்பு", meter_ideal: "சிறந்த வளர்ச்சி சாளரம்", meter_higher: "உயர் வரம்பு",
            targets_eyebrow: "பரிந்துரைக்கப்பட்ட தினசரி இலக்குகள்", targets_title: "வயதுக்கேற்ற தினசரி இலக்குகள்",
            targets_desc: "WHO மற்றும் அமெரிக்க குழந்தை மருத்துவ அகாடமியின் (AAP) ஆதாரம் சார்ந்த வழிகாட்டுதல்கள்.",
            rec_nutrition_title: "ஊட்டச்சத்து அத்தியாவசியங்கள்", rec_food_title: "உணவு பழக்கங்கள்", rec_health_title: "சுகாதார பராமரிப்பு குறிப்புகள்",
            rec_checkup_title: "பரிசோதனைகள் & தடுப்பூசிகள்", rec_milestone_title: "கவனிக்க வேண்டிய மைல்கற்கள்",
            rec_activity_title: "செயலில் விளையாட்டு & உடற்தகுதி", rec_lifestyle_title: "ஆரோக்கியமான தினசரி வழக்கங்கள்",
            doctor_note_title: "👩‍⚕️ குழந்தை மருத்துவரை எப்போது அணுக வேண்டும்",
            btn_save: "💾 வளர்ச்சி வரலாற்றில் சேமி", btn_print: "🖨️ அச்சிடு / PDF ஆக சேமி",
            btn_export_single: "📥 அறிக்கையை ஏற்றுமதி (CSV)", btn_new: "🔄 புதிய மதிப்பீடு",
            btn_export_all: "📥 அனைத்து பதிவுகளையும் ஏற்றுமதி", btn_clear_all: "🗑️ அனைத்தையும் அழி",
            empty_history: "இன்னும் சேமிக்கப்பட்ட அளவீடுகள் இல்லை. மேலே மதிப்பீட்டை முடித்து \"வளர்ச்சி வரலாற்றில் சேமி\" என்பதை கிளிக் செய்யவும்."
        },
        te: {
            form_title: "పిల్లల ప్రొఫైల్", form_subtitle: "వ్యక్తిగతీకరించిన శిశు నివేదిక రూపొందించడానికి వివరాలు నమోదు చేయండి.",
            unit_label: "యూనిట్లు:", unit_metric: "మెట్రిక్ (cm, kg)", unit_imperial: "ఇంపీరియల్ (ft/in, lbs)",
            label_child_name: "పిల్లల పేరు", label_age_years: "వయసు (సంవత్సరాలలో)", label_age_months: "అదనపు నెలలు",
            label_sex: "లింగం (పెరుగుదల ప్రమాణాలకు)", opt_boy: "👦 అబ్బాయి", opt_girl: "👧 అమ్మాయి",
            label_height_cm: "ఎత్తు / పొడవు (cm)", hint_height_cm: "పరిధి: 30 నుండి 150 cm",
            label_weight_kg: "బరువు (kg)", hint_weight_kg: "పరిధి: 1 నుండి 60 kg",
            label_height_ft: "ఎత్తు (అడుగులు)", label_height_in: "ఎత్తు (అంగుళాలు)",
            label_weight_lbs: "బరువు (పౌండ్లు)", hint_weight_lbs: "పరిధి: 2 నుండి 132 lbs",
            label_measurement: "ఎత్తు / పొడవు ఎలా కొలవబడింది?", label_activity: "ప్రస్తుత రోజువారీ కార్యకలాప స్థాయి",
            label_concern: "ప్రాథమిక సంక్షేమ దృష్టి",
            side_title: "ప్రతి పిల్లవాడు తమ స్వంత వేగంలో పెరుగుతాడు.",
            side_desc: "పెరుగుదల జన్యుశాస్త్రం, పోషణ, శారీరక కార్యకలాపాలు మరియు నిద్రతో ప్రభావితమవుతుంది.",
            side_includes_title: "మీ నివేదికలో ఉన్నవి:",
            side_inc_1: "✓ వయసు సర్దుబాటు చేయబడిన శిశు BMI గణన", side_inc_2: "✓ దృశ్య WHO & IAP పెరుగుదల గేజ్",
            side_inc_3: "✓ రోజువారీ నిద్ర, హైడ్రేషన్ & స్క్రీన్ లక్ష్యాలు", side_inc_4: "✓ మీ పిల్లల వయసుకు పోషణ",
            side_inc_5: "✓ ఆరోగ్య చిట్కాలు & టీకా రిమైండర్లు", side_inc_6: "✓ అభివృద్ధి మైలురాళ్ళు",
            side_inc_7: "✓ చురుకైన ఆట సిఫార్సులు", side_inc_8: "✓ పెరుగుదల చరిత్రను సేవ్, ప్రింట్ చేయండి",
            safety_title: "👩‍⚕️ ముఖ్యమైన శిశు వైద్య గమనిక",
            safety_desc: "FitSphere విద్యా సంక్షేమ సమాచారాన్ని అందిస్తుంది మరియు వృత్తిపరమైన వైద్య నిర్ధారణకు ప్రత్యామ్నాయం కాదు.",
            report_eyebrow: "మీ పిల్లల వ్యక్తిగతీకరించిన నివేదిక", report_title: "పెరుగుదల & సంక్షేమ అంతర్దృష్టులు",
            gauge_tag: "శిశు పెరుగుదల వర్గీకరణ",
            seg_under: "తక్కువ బరువు", seg_healthy: "ఆరోగ్యకరమైన బరువు", seg_risk: "అధిక బరువు ప్రమాదం", seg_high: "ఎక్కువ పరిధి",
            meter_lower: "తక్కువ పరిధి", meter_ideal: "ఆదర్శ పెరుగుదల విండో", meter_higher: "ఎక్కువ పరిధి",
            targets_eyebrow: "సిఫార్సు చేయబడిన రోజువారీ లక్ష్యాలు", targets_title: "వయసుకు తగిన రోజువారీ లక్ష్యాలు",
            targets_desc: "WHO మరియు అమెరికన్ అకాడమీ ఆఫ్ పీడియాట్రిక్స్ (AAP) నుండి ఆధారం-ఆధారిత శిశు మార్గదర్శకాలు.",
            rec_nutrition_title: "పోషణ ముఖ్యాంశాలు", rec_food_title: "ఆహారపు అలవాట్లు", rec_health_title: "ఆరోగ్య సంరక్షణ చిట్కాలు",
            rec_checkup_title: "పరీక్షలు & టీకాలు", rec_milestone_title: "గమనించాల్సిన మైలురాళ్ళు",
            rec_activity_title: "చురుకైన ఆట & ఫిట్‌నెస్", rec_lifestyle_title: "ఆరోగ్యకరమైన రోజువారీ దినచర్యలు",
            doctor_note_title: "👩‍⚕️ శిశు వైద్యుడిని ఎప్పుడు సంప్రదించాలి",
            btn_save: "💾 పెరుగుదల చరిత్రలో సేవ్ చేయండి", btn_print: "🖨️ ప్రింట్ / PDF గా సేవ్ చేయండి",
            btn_export_single: "📥 నివేదిక ఎగుమతి (CSV)", btn_new: "🔄 కొత్త అంచనా",
            btn_export_all: "📥 అన్ని రికార్డులు ఎగుమతి", btn_clear_all: "🗑️ అన్నీ క్లియర్ చేయండి",
            empty_history: "ఇంకా సేవ్ చేయబడిన కొలతలు లేవు. పైన అంచనా పూర్తి చేసి \"పెరుగుదల చరిత్రలో సేవ్ చేయండి\" క్లిక్ చేయండి."
        },
        es: {
            form_title: "Perfil del Niño", form_subtitle: "Completa los detalles para generar un informe de bienestar pediátrico personalizado.",
            unit_label: "Unidades:", unit_metric: "Métrico (cm, kg)", unit_imperial: "Imperial (ft/in, lbs)",
            label_child_name: "Nombre del Niño", label_age_years: "Edad en Años", label_age_months: "Meses Adicionales",
            label_sex: "Sexo (para estándares de crecimiento pediátrico)", opt_boy: "👦 Niño", opt_girl: "👧 Niña",
            label_height_cm: "Altura / Longitud (cm)", hint_height_cm: "Rango: 30 a 150 cm",
            label_weight_kg: "Peso (kg)", hint_weight_kg: "Rango: 1 a 60 kg",
            label_height_ft: "Altura (Pies)", label_height_in: "Altura (Pulgadas)",
            label_weight_lbs: "Peso (Libras)", hint_weight_lbs: "Rango: 2 a 132 lbs",
            label_measurement: "¿Cómo se midió la altura / longitud?", label_activity: "Nivel de Actividad Diaria Actual",
            label_concern: "Enfoque Principal de Bienestar",
            side_title: "Cada niño crece a su propio ritmo.",
            side_desc: "El crecimiento está influenciado por la genética, la nutrición, la actividad física y el sueño.",
            side_includes_title: "Lo que incluye tu informe:",
            side_inc_1: "✓ Cálculo de IMC pediátrico ajustado por edad", side_inc_2: "✓ Medidor visual de crecimiento WHO & IAP",
            side_inc_3: "✓ Objetivos diarios de sueño, hidratación & pantalla", side_inc_4: "✓ Nutrición para la edad de tu hijo",
            side_inc_5: "✓ Consejos de salud, revisiones & recordatorios de vacunas", side_inc_6: "✓ Hitos del desarrollo",
            side_inc_7: "✓ Recomendaciones de juego activo", side_inc_8: "✓ Guardar, imprimir y exportar historial de crecimiento",
            safety_title: "👩‍⚕️ Nota Pediátrica Importante",
            safety_desc: "FitSphere proporciona información educativa de bienestar y no es un sustituto del diagnóstico médico profesional.",
            report_eyebrow: "INFORME PERSONALIZADO DE TU HIJO", report_title: "Perspectivas de Crecimiento & Bienestar",
            gauge_tag: "CLASIFICACIÓN DE CRECIMIENTO PEDIÁTRICO",
            seg_under: "Bajo peso", seg_healthy: "Peso saludable", seg_risk: "Riesgo de sobrepeso", seg_high: "Rango elevado",
            meter_lower: "Rango Bajo", meter_ideal: "Ventana de Crecimiento Ideal", meter_higher: "Rango Alto",
            targets_eyebrow: "OBJETIVOS DIARIOS RECOMENDADOS", targets_title: "Objetivos Diarios Apropiados para la Edad",
            targets_desc: "Guías pediátricas basadas en evidencia de la OMS y la Academia Americana de Pediatría (AAP).",
            rec_nutrition_title: "Esenciales de Nutrición", rec_food_title: "Hábitos Alimentarios", rec_health_title: "Consejos de Salud",
            rec_checkup_title: "Revisiones & Vacunas", rec_milestone_title: "Hitos a Observar",
            rec_activity_title: "Juego Activo & Fitness", rec_lifestyle_title: "Rutinas Diarias Saludables",
            doctor_note_title: "👩‍⚕️ Cuándo Consultar a un Pediatra",
            btn_save: "💾 Guardar en Historial de Crecimiento", btn_print: "🖨️ Imprimir / Guardar como PDF",
            btn_export_single: "📥 Exportar Informe (CSV)", btn_new: "🔄 Nueva Evaluación",
            btn_export_all: "📥 Exportar Todos los Registros", btn_clear_all: "🗑️ Limpiar Todo",
            empty_history: "Aún no hay mediciones guardadas. Completa una evaluación arriba y haz clic en \"Guardar en Historial de Crecimiento\"."
        }
    };

    // Merge extra keys into TRANSLATIONS
    Object.keys(EXTRA_KEYS).forEach(lang => {
        if (TRANSLATIONS[lang]) Object.assign(TRANSLATIONS[lang], EXTRA_KEYS[lang]);
    });

    const LANG_LABELS = { en: "EN", hi: "हि", ta: "த", te: "తె", es: "ES" };
    let currentLang = localStorage.getItem("fitsphereLang") || "en";

    function applyLanguage(lang) {
        const dict = TRANSLATIONS[lang];
        if (!dict) return;
        currentLang = lang;
        localStorage.setItem("fitsphereLang", lang);

        // Update all data-i18n elements
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key] !== undefined) {
                el.innerHTML = dict[key];
            }
        });

        // Update html lang attribute
        document.documentElement.lang = lang;

        // Update language button label
        const langLabel = document.getElementById("langLabel");
        if (langLabel) langLabel.textContent = LANG_LABELS[lang] || lang.toUpperCase();

        // Update active state in dropdown and mobile buttons
        document.querySelectorAll(".lang-option, .lang-btn-mobile").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
        });
    }

    // Language Switcher Toggle
    const langToggleBtn = document.getElementById("langToggleBtn");
    const langDropdown = document.getElementById("langDropdown");

    if (langToggleBtn && langDropdown) {
        langToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle("open");
        });

        document.querySelectorAll(".lang-option").forEach(btn => {
            btn.addEventListener("click", () => {
                const lang = btn.getAttribute("data-lang");
                applyLanguage(lang);
                langDropdown.classList.remove("open");
                showToast(lang === "en" ? "Language: English" : `Language changed!`, "success");
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!langToggleBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.remove("open");
            }
        });
    }

    // Mobile lang buttons
    document.querySelectorAll(".lang-btn-mobile").forEach(btn => {
        btn.addEventListener("click", () => {
            const lang = btn.getAttribute("data-lang");
            applyLanguage(lang);
            // update active state on mobile buttons
            document.querySelectorAll(".lang-btn-mobile").forEach(b => b.classList.toggle("active", b.getAttribute("data-lang") === lang));
            toggleMobileMenu(false);
        });
    });

    // ==========================================================================
    // 18. INITIALIZATION
    // ==========================================================================
    displayHistory();
    if (currentLang !== "en") applyLanguage(currentLang);

});
