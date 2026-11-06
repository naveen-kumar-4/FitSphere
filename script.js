// ==========================================================================
// FITSPHERE - CHILD GROWTH & WELLNESS PLATFORM
// Client-side Application Logic & Pediatric Growth Reference Engine
// ==========================================================================

document.addEventListener("DOMContentLoaded", function() {

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
    // 2. ACCESSIBILITY: TEXT SIZE SCALER
    // ==========================================================================
    function initTextScale() {
        const savedScale = localStorage.getItem("fitsphereFontScale") || "1";
        applyFontScale(savedScale);

        // Desktop buttons
        document.querySelectorAll(".text-size-widget .size-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const scale = btn.getAttribute("data-scale");
                applyFontScale(scale);
            });
        });

        // Mobile buttons
        document.querySelectorAll(".mobile-size-control .size-btn-mobile").forEach(btn => {
            btn.addEventListener("click", () => {
                const scale = btn.getAttribute("data-scale");
                applyFontScale(scale);
            });
        });
    }

    function applyFontScale(scale) {
        document.documentElement.style.setProperty("--font-scale", scale);
        localStorage.setItem("fitsphereFontScale", scale);

        // Update active classes
        document.querySelectorAll(".size-btn, .size-btn-mobile").forEach(btn => {
            if (btn.getAttribute("data-scale") === scale) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
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
    ageYearsInput.addEventListener("input", function() {
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
    // 6. QUICK DEMO DATA LOADER
    // ==========================================================================
    function fillDemoProfile() {
        childNameInput.value = "Aarav";
        ageYearsInput.value = "4";
        ageMonthsInput.value = "3";
        
        const boyRadio = document.querySelector('input[name="sex"][value="boy"]');
        if (boyRadio) boyRadio.checked = true;

        if (currentUnit === "metric") {
            heightInput.value = "104.5";
            weightInput.value = "16.8";
        } else {
            heightFtInput.value = "3";
            heightInInput.value = "5.1";
            weightLbsInput.value = "37.0";
        }

        measurementSelect.value = "standing";
        activitySelect.value = "moderate";
        concernSelect.value = "general";

        showToast("Loaded demo profile for Aarav (4 yrs)!", "success");

        document.getElementById("assessment").scrollIntoView({ behavior: "smooth" });
    }

    const demoBtn = document.getElementById("demoBtn");
    const heroDemoBtn = document.getElementById("heroDemoBtn");
    if (demoBtn) demoBtn.addEventListener("click", fillDemoProfile);
    if (heroDemoBtn) heroDemoBtn.addEventListener("click", fillDemoProfile);

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
        b0: { label: "Newborn to 5 months",
            nutrition: ["Exclusive breastfeeding on demand (8–12 feeds/day) meets all needs; no water, honey, ghutti or top feeds.", "If not breastfed, use only standard infant formula prepared with boiled, cooled water exactly as per the tin.", "Give vitamin D drops (about 400 IU/day) if your pediatrician advises."],
            food: ["Feed on hunger cues (rooting, hand-to-mouth) rather than the clock.", "Burp after feeds and keep the baby upright for 15–20 minutes to reduce spit-up.", "Wash hands and sterilise bottles, nipples and pump parts every time."],
            health: ["Place baby on the back to sleep, on a firm flat surface with nothing loose in the cot.", "Keep the cord stump clean and dry; bathe with lukewarm water and mild baby soap.", "Fever of 100.4°F (38°C) or higher in a baby under 3 months needs a doctor right away."],
            checkups: ["Birth doses: BCG, OPV-0 and Hepatitis B.", "6, 10 and 14 weeks: DTP, IPV, Hib, Hep B, Rotavirus and PCV.", "Weight and length check at every visit; ask about newborn screening."],
            milestones: ["Follows faces and sounds; smiles socially by about 2 months.", "Holds head up in tummy time by 3–4 months."] },
        b6: { label: "6 to 11 months",
            nutrition: ["Start solids at 6 months while continuing breastfeeding/formula: ragi porridge, dal khichdi, mashed banana, well-cooked egg, curd.", "Prioritise iron: ragi, dal, egg, meat/fish and green leafy vegetables with a vitamin C food such as lemon or tomato.", "Aim for 2–3 meals by 8 months and 3 meals + 1–2 snacks by 9–11 months."],
            food: ["Introduce one new food at a time, 3 days apart, and watch for rash, vomiting or swelling.", "Move from smooth purée to mashed and soft finger foods; let baby self-feed and explore.", "No salt, sugar, honey, packaged baby snacks, cow's milk as a drink, juice, whole nuts, grapes or popcorn."],
            health: ["Offer small sips of boiled-cooled water with meals once solids begin.", "Start brushing the first teeth with a rice-grain smear of fluoride toothpaste.", "Baby-proof the home: socket covers, no small objects in reach, and never leave baby alone near water."],
            checkups: ["6 months: influenza (yearly) plus a growth and anaemia review.", "9 months: MMR-1 and typhoid conjugate vaccine.", "Hearing, vision and development screening at routine visits."],
            milestones: ["Sits without support by 6–8 months; crawls and pulls to stand by 9–11 months.", "Babbles, responds to own name and waves bye-bye."] },
        b12: { label: "1 to 2 years",
            nutrition: ["Move to family foods: roti, rice, dal, vegetables, egg, paneer, fish or chicken, cut small and soft.", "Offer 400–500 ml whole milk/dairy a day (too much milk crowds out iron-rich food); breastfeeding can continue to 2 years.", "Add healthy fats: ghee, nut powder or paste, oil in cooking."],
            food: ["3 meals + 2 small snacks at regular times; avoid grazing and milk bottles between meals.", "Toddlers are picky: keep offering rejected foods calmly 10–15 times without forcing or bribing.", "Avoid whole nuts, whole grapes, popcorn and hard raw carrot (choking), plus juice, sweets and biscuits."],
            health: ["Brush twice daily with a smear of fluoride toothpaste; first dental check by age 1 and no night-time bottles.", "Wash hands before meals and after toilet or play; keep nails short.", "Give iron or vitamin D supplements only if prescribed."],
            checkups: ["12 months: Hepatitis A-1 (and a hemoglobin check).", "15–18 months: MMR-2, varicella, and DTP/Hib/IPV boosters.", "18 months: Hepatitis A-2 and developmental screening."],
            milestones: ["Walks alone by 12–15 months; says a few words by 18 months.", "Points to show things, follows simple instructions, scribbles."] },
        b24: { label: "2 to 4 years",
            nutrition: ["Plate guide: half vegetables and fruit, a quarter whole grains (roti, millets, brown rice), a quarter protein (dal, egg, paneer, chicken, fish).", "2 cups of milk/curd daily for calcium; include iron foods such as ragi, beetroot and green leaves.", "Choose whole fruit over juice and water over sweet drinks."],
            food: ["Eat together at the table with no TV or phone; keep meals to about 20–30 minutes.", "Let your child serve small portions and choose between two healthy options.", "Don't use sweets or chips as rewards or bribes; keep them for occasional treats."],
            health: ["Brush twice daily with a pea-sized amount of fluoride toothpaste with an adult helping; dental check every 6 months.", "Teach 20-second handwashing; keep up to date on vaccines and ask about deworming.", "Use car seats or child restraints and give constant supervision near water."],
            checkups: ["Check height, weight and BMI-for-age at least every 6 months.", "Annual vision, hearing and anaemia review; yearly influenza shot.", "Typhoid booster and any pending vaccines per your pediatrician."],
            milestones: ["Speaks in 2–3 word sentences by age 2 and full sentences by 3–4.", "Runs, jumps, climbs stairs, starts toilet training and plays with other children."] },
        b60: { label: "5 to 7 years",
            nutrition: ["Never skip breakfast: protein plus whole grain (egg, besan chilla, idli with sambar, poha with peanuts, oats with milk).", "Build bones with 2–3 servings of dairy/calcium daily (milk, curd, paneer, ragi, sesame) and morning sunlight for vitamin D.", "Pack a healthy lunchbox: roti or rice, a vegetable, protein and a fruit."],
            food: ["Keep fixed times for 3 meals and 2 snacks, and try one new vegetable each week.", "Limit chips, biscuits, instant noodles, sweets and sugary drinks to occasional, not daily.", "Involve your child in washing vegetables, mixing and plating food; children eat what they help prepare."],
            health: ["Brush twice daily and floss once teeth touch; dental check every 6 months.", "Get an annual eye check (especially if squinting or sitting close to screens) and limit screens.", "Teach road safety, personal safety and asking a trusted adult for help."],
            checkups: ["4–6 years: DTP booster-2, MMR-3/varicella-2 and IPV as advised by your pediatrician.", "Yearly height, weight, BMI and blood pressure where available.", "Yearly influenza vaccine and hemoglobin test."],
            milestones: ["Ties shoelaces, hops, catches a ball and draws a person with detail.", "Recognises letters and numbers, follows 3-step instructions, makes friends."] },
        b96: { label: "8 to 10 years",
            nutrition: ["Needs more protein, iron and calcium for growth spurts: dal, legumes, eggs, milk, paneer, leafy vegetables, nuts and seeds.", "Aim for 5 portions of fruit and vegetables daily, with whole grains and millets over refined flour.", "Girls approaching puberty need extra iron (greens, ragi, dates, meat) with vitamin C foods."],
            food: ["Encourage a protein-rich breakfast and discourage skipping meals or emotional eating.", "Cut down on fried snacks, cold drinks, energy drinks, fast food and packaged sweets; read labels together.", "Talk about food positively; avoid calling foods \"bad\" or commenting on body size."],
            health: ["Teach independent hygiene: daily bath, clean clothes, hair and nail care, brushing twice and handwashing.", "Begin age-appropriate talks about body changes before puberty starts (girls often begin at 8–10).", "Watch posture, keep school bags under 10–15% of body weight and get yearly eye tests."],
            checkups: ["9–14 years: HPV vaccine (girls) as per IAP guidance; 10–12 years: Tdap booster.", "Annual growth check on percentile charts, plus vision, dental and hemoglobin screening.", "Discuss sleep, mood, bullying and screen use at visits."],
            milestones: ["Reads fluently, reasons logically and manages homework with some independence.", "Early puberty signs may appear (growth spurt, body odor, breast buds in girls); ask your doctor if before age 8."] }
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
            ? `${profile.height} cm (${Math.floor((profile.height/2.54)/12)}' ${Math.round(((profile.height/2.54)%12)*10)/10}")`
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
    form.addEventListener("submit", function(event) {
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
    document.getElementById("saveBtn").addEventListener("click", function() {
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
    document.getElementById("clearHistoryBtn").addEventListener("click", function() {
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

    document.getElementById("exportHistoryBtn").addEventListener("click", function() {
        const history = getHistory();
        exportToCSV(history, "FitSphere-All-Child-Records.csv");
    });

    const exportSingleBtn = document.getElementById("exportSingleBtn");
    if (exportSingleBtn) {
        exportSingleBtn.addEventListener("click", function() {
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
    document.getElementById("printBtn").addEventListener("click", function() {
        window.print();
    });

    document.getElementById("newBtn").addEventListener("click", function() {
        form.reset();
        currentProfile = null;
        results.hidden = true;
        document.getElementById("assessment").scrollIntoView({ behavior: "smooth" });
        showToast("Form reset. Ready for new assessment.", "info");
    });

    // ==========================================================================
    // 16. FLOATING BACK TO TOP BUTTON
    // ==========================================================================
    window.addEventListener("scroll", function() {
        if (window.scrollY > 350) {
            backToTopBtn.classList.add("show");
        } else {
            backToTopBtn.classList.remove("show");
        }
    });

    backToTopBtn.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ==========================================================================
    // 17. INITIALIZATION
    // ==========================================================================
    initTextScale();
    displayHistory();

});
