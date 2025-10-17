import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [userProgress, setUserProgress] = useState({
    totalVerses: 0,
    memorizedVerses: 0,
    currentSurah: null,
    currentLine: 0,
    streak: 0,
    totalTime: 0,
    achievements: [],
    lastStudyDate: null,
    dailyGoal: 3,
    weeklyGoal: 15,
    surahProgress: {}
  });
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [currentSurahData, setCurrentSurahData] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [learningSession, setLearningSession] = useState({
    startTime: null,
    currentSurah: null,
    currentLine: 0,
    practiceCount: 0,
    sessionTime: 0
  });
  const [showTranslation, setShowTranslation] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showSurahSelection, setShowSurahSelection] = useState(false);
  const [surahSearchTerm, setSurahSearchTerm] = useState('');
  const [surahCompleted, setSurahCompleted] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`progress_${user.id}`);
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, [user.id]);

  useEffect(() => {
    localStorage.setItem(`progress_${user.id}`, JSON.stringify(userProgress));
  }, [userProgress, user.id]);
  useEffect(() => {
    const completeQuran = [
      { id: 1, name: 'Al-Fatiha', nameArabic: 'الفاتحة', verses: 7, lines: [
        { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
        { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of the worlds.' },
        { arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful.' },
        { arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.' },
        { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.' },
        { arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path.' },
        { arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.' }
      ]},
      { id: 2, name: 'Al-Baqarah', nameArabic: 'البقرة', verses: 286, lines: [
        { arabic: 'الم', translation: 'Alif, Lam, Meem.' },
        { arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ', translation: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah.' },
        { arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ', translation: 'Who believe in the unseen, establish prayer, and spend out of what We have provided for them.' },
        { arabic: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ', translation: 'And who believe in what has been revealed to you, and what was revealed before you, and of the Hereafter they are certain.' },
        { arabic: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ', translation: 'Those are upon guidance from their Lord.' },
        { arabic: 'وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ', translation: 'And it is those who are the successful.' },
        { arabic: 'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ', translation: 'Indeed, those who disbelieve - it is all the same for them.' },
        { arabic: 'أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ', translation: 'Whether you warn them or do not warn them.' },
        { arabic: 'لَا يُؤْمِنُونَ', translation: 'They will not believe.' },
        { arabic: 'خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ', translation: 'Allah has set a seal upon their hearts and upon their hearing.' }
      ]},
      { id: 3, name: 'Ali Imran', nameArabic: 'آل عمران', verses: 200, lines: [
        { arabic: 'الم', translation: 'Alif, Lam, Meem.' },
        { arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.' },
        { arabic: 'نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ', translation: 'He has sent down upon you the Book in truth, confirming what was before it.' },
        { arabic: 'وَأَنزَلَ التَّوْرَاةَ وَالْإِنجِيلَ', translation: 'And He revealed the Torah and the Gospel.' },
        { arabic: 'مِن قَبْلُ هُدًى لِّلنَّاسِ', translation: 'Before as guidance for the people.' },
        { arabic: 'وَأَنزَلَ الْفُرْقَانَ', translation: 'And He revealed the Criterion.' },
        { arabic: 'إِنَّ الَّذِينَ كَفَرُوا بِآيَاتِ اللَّهِ', translation: 'Indeed, those who disbelieve in the verses of Allah.' },
        { arabic: 'لَهُمْ عَذَابٌ شَدِيدٌ', translation: 'Will have a severe punishment.' },
        { arabic: 'وَاللَّهُ عَزِيزٌ ذُو انتِقَامٍ', translation: 'And Allah is Exalted in Might and Owner of Retribution.' }
      ]},
      { id: 4, name: 'An-Nisa', nameArabic: 'النساء', verses: 176, lines: [
        { arabic: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ', translation: 'O mankind, fear your Lord, who created you from one soul.' },
        { arabic: 'وَآتُوا النَّسَاءَ صَدُقَاتِهِنَّ نِحْلَةً', translation: 'And give the women their dowries as a gift.' }
      ]},
      { id: 5, name: 'Al-Maidah', nameArabic: 'المائدة', verses: 120, lines: [
        { arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ', translation: 'O you who have believed, fulfill your contracts.' },
        { arabic: 'أُحِلَّتْ لَكُم بَهِيمَةُ الْأَنْعَامِ', translation: 'Made lawful to you are the grazing livestock.' }
      ]},
      { id: 6, name: 'Al-Anam', nameArabic: 'الأنعام', verses: 165, lines: [
        { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ', translation: 'Praise be to Allah, who created the heavens and the earth.' }
      ]},
      { id: 7, name: 'Al-Araf', nameArabic: 'الأعراف', verses: 206, lines: [
        { arabic: 'المص', translation: 'Alif, Lam, Meem, Sad.' },
        { arabic: 'كِتَابٌ أُنزِلَ إِلَيْكَ فَلَا يَكُن فِي صَدْرِكَ حَرَجٌ مِّنْهُ', translation: 'A Book revealed to you, so let there be no constraint in your chest from it.' }
      ]},
      { id: 8, name: 'Al-Anfal', nameArabic: 'الأنفال', verses: 75, lines: [
        { arabic: 'يَسْأَلُونَكَ عَنِ الْأَنفَالِ', translation: 'They ask you about the spoils of war.' }
      ]},
      { id: 9, name: 'At-Tawbah', nameArabic: 'التوبة', verses: 129, lines: [
        { arabic: 'بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ', translation: 'A discharge from Allah and His Messenger.' }
      ]},
      { id: 10, name: 'Yunus', nameArabic: 'يونس', verses: 109, lines: [
        { arabic: 'الر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ', translation: 'Alif, Lam, Ra. These are the verses of the wise Book.' }
      ]},
      { id: 11, name: 'Hud', nameArabic: 'هود', verses: 123, lines: [
        { arabic: 'الر ۚ كِتَابٌ أُحْكِمَتْ آيَاتُهُ', translation: 'Alif, Lam, Ra. A Book whose verses are perfected.' }
      ]},
      { id: 12, name: 'Yusuf', nameArabic: 'يوسف', verses: 111, lines: [
        { arabic: 'الر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ', translation: 'Alif, Lam, Ra. These are the verses of the clear Book.' }
      ]},
      { id: 13, name: 'Ar-Rad', nameArabic: 'الرعد', verses: 43, lines: [
        { arabic: 'المر ۚ تِلْكَ آيَاتُ الْكِتَابِ', translation: 'Alif, Lam, Meem, Ra. These are the verses of the Book.' }
      ]},
      { id: 14, name: 'Ibrahim', nameArabic: 'إبراهيم', verses: 52, lines: [
        { arabic: 'الر ۚ كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ', translation: 'Alif, Lam, Ra. A Book which We have revealed to you.' },
        { arabic: 'لِتُنذِرَ أُمَّ الْقُرَىٰ وَمَنْ حَوْلَهَا', translation: 'That you may warn the people of Makkah and those around it.' },
        { arabic: 'وَالَّذِينَ لَا يُؤْمِنُونَ بِالْآخِرَةِ', translation: 'And those who do not believe in the Hereafter.' },
        { arabic: 'وَمَا أَرْسَلْنَا مِن رَّسُولٍ إِلَّا بِلِسَانِ قَوْمِهِ', translation: 'And We did not send any messenger except in the language of his people.' },
        { arabic: 'لِيُبَيِّنَ لَهُمْ', translation: 'To make clear to them.' },
        { arabic: 'فَيُضِلُّ اللَّهُ مَن يَشَاءُ وَيَهْدِي مَن يَشَاءُ', translation: 'So Allah leaves astray whom He wills and guides whom He wills.' },
        { arabic: 'وَهُوَ الْعَزِيزُ الْحَكِيمُ', translation: 'And He is the Exalted in Might, the Wise.' },
        { arabic: 'وَلَقَدْ أَرْسَلْنَا مُوسَىٰ بِآيَاتِنَا', translation: 'And We certainly sent Moses with Our signs.' },
        { arabic: 'أَن أَخْرِجْ قَوْمَكَ مِنَ الظُّلُمَاتِ إِلَى النُّورِ', translation: 'Saying, Bring your people out of darknesses into the light.' },
        { arabic: 'وَذَكِّرْهُم بِأَيَّامِ اللَّهِ', translation: 'And remind them of the days of Allah.' }
      ]},
      { id: 15, name: 'Al-Hijr', nameArabic: 'الحجر', verses: 99, lines: [
        { arabic: 'الر ۚ تِلْكَ آيَاتُ الْكِتَابِ', translation: 'Alif, Lam, Ra. These are the verses of the Book.' }
      ]},
      { id: 16, name: 'An-Nahl', nameArabic: 'النحل', verses: 128, lines: [
        { arabic: 'أَتَىٰ أَمْرُ اللَّهِ فَلَا تَسْتَعْجِلُوهُ', translation: 'The command of Allah has come, so do not hasten it.' }
      ]},
      { id: 17, name: 'Al-Isra', nameArabic: 'الإسراء', verses: 111, lines: [
        { arabic: 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا', translation: 'Exalted is He who took His Servant by night.' }
      ]},
      { id: 18, name: 'Al-Kahf', nameArabic: 'الكهف', verses: 110, lines: [
        { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ', translation: 'Praise be to Allah, who has sent down upon His Servant the Book.' }
      ]},
      { id: 19, name: 'Maryam', nameArabic: 'مريم', verses: 98, lines: [
        { arabic: 'كهيعص', translation: 'Kaf, Ha, Ya, Ain, Sad.' }
      ]},
      { id: 20, name: 'Taha', nameArabic: 'طه', verses: 135, lines: [
        { arabic: 'طه', translation: 'Ta, Ha.' }
      ]},
      { id: 21, name: 'Al-Anbiya', nameArabic: 'الأنبياء', verses: 112, lines: [
        { arabic: 'اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ', translation: 'The time of their reckoning has approached for mankind.' }
      ]},
      { id: 22, name: 'Al-Hajj', nameArabic: 'الحج', verses: 78, lines: [
        { arabic: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمْ', translation: 'O mankind, fear your Lord.' }
      ]},
      { id: 23, name: 'Al-Muminun', nameArabic: 'المؤمنون', verses: 118, lines: [
        { arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ', translation: 'Certainly will the believers have succeeded.' }
      ]},
      { id: 24, name: 'An-Nur', nameArabic: 'النور', verses: 64, lines: [
        { arabic: 'سُورَةٌ أَنزَلْنَاهَا وَفَرَضْنَاهَا', translation: 'A surah which We have sent down and made obligatory.' }
      ]},
      { id: 25, name: 'Al-Furqan', nameArabic: 'الفرقان', verses: 77, lines: [
        { arabic: 'تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ', translation: 'Blessed is He who sent down the Criterion.' }
      ]},
      { id: 26, name: 'Ash-Shuara', nameArabic: 'الشعراء', verses: 227, lines: [
        { arabic: 'طسم', translation: 'Ta, Sin, Meem.' }
      ]},
      { id: 27, name: 'An-Naml', nameArabic: 'النمل', verses: 93, lines: [
        { arabic: 'طس ۚ تِلْكَ آيَاتُ الْقُرْآنِ', translation: 'Ta, Sin. These are the verses of the Quran.' }
      ]},
      { id: 28, name: 'Al-Qasas', nameArabic: 'القصص', verses: 88, lines: [
        { arabic: 'طسم', translation: 'Ta, Sin, Meem.' }
      ]},
      { id: 29, name: 'Al-Ankabut', nameArabic: 'العنكبوت', verses: 69, lines: [
        { arabic: 'الم', translation: 'Alif, Lam, Meem.' }
      ]},
      { id: 30, name: 'Ar-Rum', nameArabic: 'الروم', verses: 60, lines: [
        { arabic: 'الم', translation: 'Alif, Lam, Meem.' }
      ]},
      { id: 31, name: 'Luqman', nameArabic: 'لقمان', verses: 34, lines: [
        { arabic: 'الم', translation: 'Alif, Lam, Meem.' }
      ]},
      { id: 32, name: 'As-Sajdah', nameArabic: 'السجدة', verses: 30, lines: [
        { arabic: 'الم', translation: 'Alif, Lam, Meem.' }
      ]},
      { id: 33, name: 'Al-Ahzab', nameArabic: 'الأحزاب', verses: 73, lines: [
        { arabic: 'يَا أَيُّهَا النَّبِيُّ اتَّقِ اللَّهَ', translation: 'O Prophet, fear Allah.' }
      ]},
      { id: 34, name: 'Saba', nameArabic: 'سبأ', verses: 54, lines: [
        { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي لَهُ مَا فِي السَّمَاوَاتِ', translation: 'Praise be to Allah, to whom belongs whatever is in the heavens.' }
      ]},
      { id: 35, name: 'Fatir', nameArabic: 'فاطر', verses: 45, lines: [
        { arabic: 'الْحَمْدُ لِلَّهِ فَاطِرِ السَّمَاوَاتِ', translation: 'Praise be to Allah, Creator of the heavens.' }
      ]},
      { id: 36, name: 'Ya-Sin', nameArabic: 'يس', verses: 83, lines: [
        { arabic: 'يس', translation: 'Ya, Sin.' }
      ]},
      { id: 37, name: 'As-Saffat', nameArabic: 'الصافات', verses: 182, lines: [
        { arabic: 'وَالصَّافَّاتِ صَفًّا', translation: 'By those lined up in rows.' }
      ]},
      { id: 38, name: 'Sad', nameArabic: 'ص', verses: 88, lines: [
        { arabic: 'ص ۚ وَالْقُرْآنِ ذِي الذِّكْرِ', translation: 'Sad. By the Quran containing the reminder.' }
      ]},
      { id: 39, name: 'Az-Zumar', nameArabic: 'الزمر', verses: 75, lines: [
        { arabic: 'تَنزِيلُ الْكِتَابِ مِنَ اللَّهِ', translation: 'The revelation of the Book is from Allah.' }
      ]},
      { id: 40, name: 'Ghafir', nameArabic: 'غافر', verses: 85, lines: [
        { arabic: 'حم', translation: 'Ha, Meem.' }
      ]},
      { id: 41, name: 'Fussilat', nameArabic: 'فصلت', verses: 54, lines: [
        { arabic: 'حم', translation: 'Ha, Meem.' }
      ]},
      { id: 42, name: 'Ash-Shura', nameArabic: 'الشورى', verses: 53, lines: [
        { arabic: 'حم', translation: 'Ha, Meem.' }
      ]},
      { id: 43, name: 'Az-Zukhruf', nameArabic: 'الزخرف', verses: 89, lines: [
        { arabic: 'حم', translation: 'Ha, Meem.' }
      ]},
      { id: 44, name: 'Ad-Dukhan', nameArabic: 'الدخان', verses: 59, lines: [
        { arabic: 'حم', translation: 'Ha, Meem.' }
      ]},
      { id: 45, name: 'Al-Jathiyah', nameArabic: 'الجاثية', verses: 37, lines: [
        { arabic: 'حم', translation: 'Ha, Meem.' }
      ]},
      { id: 46, name: 'Al-Ahqaf', nameArabic: 'الأحقاف', verses: 35, lines: [
        { arabic: 'حم', translation: 'Ha, Meem.' }
      ]},
      { id: 47, name: 'Muhammad', nameArabic: 'محمد', verses: 38, lines: [
        { arabic: 'الَّذِينَ كَفَرُوا وَصَدُّوا عَن سَبِيلِ اللَّهِ', translation: 'Those who disbelieve and avert from the way of Allah.' }
      ]},
      { id: 48, name: 'Al-Fath', nameArabic: 'الفتح', verses: 29, lines: [
        { arabic: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا', translation: 'Indeed, We have given you a clear victory.' }
      ]},
      { id: 49, name: 'Al-Hujurat', nameArabic: 'الحجرات', verses: 18, lines: [
        { arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُقَدِّمُوا', translation: 'O you who have believed, do not put yourselves before Allah.' }
      ]},
      { id: 50, name: 'Qaf', nameArabic: 'ق', verses: 45, lines: [
        { arabic: 'ق ۚ وَالْقُرْآنِ الْمَجِيدِ', translation: 'Qaf. By the honored Quran.' }
      ]},
      { id: 51, name: 'Adh-Dhariyat', nameArabic: 'الذاريات', verses: 60, lines: [
        { arabic: 'وَالذَّارِيَاتِ ذَرْوًا', translation: 'By the scattering winds.' }
      ]},
      { id: 52, name: 'At-Tur', nameArabic: 'الطور', verses: 49, lines: [
        { arabic: 'وَالطُّورِ', translation: 'By the mount.' }
      ]},
      { id: 53, name: 'An-Najm', nameArabic: 'النجم', verses: 62, lines: [
        { arabic: 'وَالنَّجْمِ إِذَا هَوَىٰ', translation: 'By the star when it descends.' }
      ]},
      { id: 54, name: 'Al-Qamar', nameArabic: 'القمر', verses: 55, lines: [
        { arabic: 'اقْتَرَبَتِ السَّاعَةُ', translation: 'The Hour has drawn near.' }
      ]},
      { id: 55, name: 'Ar-Rahman', nameArabic: 'الرحمن', verses: 78, lines: [
        { arabic: 'الرَّحْمَٰنُ', translation: 'The Most Merciful.' }
      ]},
      { id: 56, name: 'Al-Waqiah', nameArabic: 'الواقعة', verses: 96, lines: [
        { arabic: 'إِذَا وَقَعَتِ الْوَاقِعَةُ', translation: 'When the occurrence occurs.' }
      ]},
      { id: 57, name: 'Al-Hadid', nameArabic: 'الحديد', verses: 29, lines: [
        { arabic: 'سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ', translation: 'Whatever is in the heavens and earth exalts Allah.' }
      ]},
      { id: 58, name: 'Al-Mujadila', nameArabic: 'المجادلة', verses: 22, lines: [
        { arabic: 'قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ', translation: 'Allah has heard the speech of the one who argues with you.' }
      ]},
      { id: 59, name: 'Al-Hashr', nameArabic: 'الحشر', verses: 24, lines: [
        { arabic: 'سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ', translation: 'Whatever is in the heavens and earth exalts Allah.' }
      ]},
      { id: 60, name: 'Al-Mumtahanah', nameArabic: 'الممتحنة', verses: 13, lines: [
        { arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَّخِذُوا', translation: 'O you who have believed, do not take My enemies.' }
      ]},
      { id: 61, name: 'As-Saff', nameArabic: 'الصف', verses: 14, lines: [
        { arabic: 'سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ', translation: 'Whatever is in the heavens and earth exalts Allah.' }
      ]},
      { id: 62, name: 'Al-Jumuah', nameArabic: 'الجمعة', verses: 11, lines: [
        { arabic: 'يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ', translation: 'Whatever is in the heavens and earth exalts Allah.' }
      ]},
      { id: 63, name: 'Al-Munafiqun', nameArabic: 'المنافقون', verses: 11, lines: [
        { arabic: 'إِذَا جَاءَكَ الْمُنَافِقُونَ', translation: 'When the hypocrites come to you.' }
      ]},
      { id: 64, name: 'At-Taghabun', nameArabic: 'التغابن', verses: 18, lines: [
        { arabic: 'يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ', translation: 'Whatever is in the heavens and earth exalts Allah.' }
      ]},
      { id: 65, name: 'At-Talaq', nameArabic: 'الطلاق', verses: 12, lines: [
        { arabic: 'يَا أَيُّهَا النَّبِيُّ إِذَا طَلَّقْتُمُ', translation: 'O Prophet, when you divorce women.' }
      ]},
      { id: 66, name: 'At-Tahrim', nameArabic: 'التحريم', verses: 12, lines: [
        { arabic: 'يَا أَيُّهَا النَّبِيُّ لِمَ تُحَرِّمُ', translation: 'O Prophet, why do you prohibit.' }
      ]},
      { id: 67, name: 'Al-Mulk', nameArabic: 'الملك', verses: 30, lines: [
        { arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ', translation: 'Blessed is He in whose hand is dominion.' }
      ]},
      { id: 68, name: 'Al-Qalam', nameArabic: 'القلم', verses: 52, lines: [
        { arabic: 'ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ', translation: 'Nun. By the pen and what they inscribe.' }
      ]},
      { id: 69, name: 'Al-Haqqah', nameArabic: 'الحاقة', verses: 52, lines: [
        { arabic: 'الْحَاقَّةُ', translation: 'The Inevitable Reality.' }
      ]},
      { id: 70, name: 'Al-Maarij', nameArabic: 'المعارج', verses: 44, lines: [
        { arabic: 'سَأَلَ سَائِلٌ بِعَذَابٍ وَاقِعٍ', translation: 'A questioner asked about a punishment bound to happen.' }
      ]},
      { id: 71, name: 'Nuh', nameArabic: 'نوح', verses: 28, lines: [
        { arabic: 'إِنَّا أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ', translation: 'Indeed, We sent Noah to his people.' }
      ]},
      { id: 72, name: 'Al-Jinn', nameArabic: 'الجن', verses: 28, lines: [
        { arabic: 'قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ', translation: 'Say, it has been revealed to me that a group of jinn listened.' }
      ]},
      { id: 73, name: 'Al-Muzzammil', nameArabic: 'المزمل', verses: 20, lines: [
        { arabic: 'يَا أَيُّهَا الْمُزَّمِّلُ', translation: 'O you who wraps himself.' }
      ]},
      { id: 74, name: 'Al-Muddaththir', nameArabic: 'المدثر', verses: 56, lines: [
        { arabic: 'يَا أَيُّهَا الْمُدَّثِّرُ', translation: 'O you who covers himself.' }
      ]},
      { id: 75, name: 'Al-Qiyamah', nameArabic: 'القيامة', verses: 40, lines: [
        { arabic: 'لَا أُقْسِمُ بِيَوْمِ الْقِيَامَةِ', translation: 'I swear by the Day of Resurrection.' }
      ]},
      { id: 76, name: 'Al-Insan', nameArabic: 'الإنسان', verses: 31, lines: [
        { arabic: 'هَلْ أَتَىٰ عَلَى الْإِنسَانِ', translation: 'Has there come upon man a period of time.' }
      ]},
      { id: 77, name: 'Al-Mursalat', nameArabic: 'المرسلات', verses: 50, lines: [
        { arabic: 'وَالْمُرْسَلَاتِ عُرْفًا', translation: 'By the winds sent forth.' }
      ]},
      { id: 78, name: 'An-Naba', nameArabic: 'النبأ', verses: 40, lines: [
        { arabic: 'عَمَّ يَتَسَاءَلُونَ', translation: 'About what are they asking one another?' }
      ]},
      { id: 79, name: 'An-Naziat', nameArabic: 'النازعات', verses: 46, lines: [
        { arabic: 'وَالنَّازِعَاتِ غَرْقًا', translation: 'By those who extract with violence.' }
      ]},
      { id: 80, name: 'Abasa', nameArabic: 'عبس', verses: 42, lines: [
        { arabic: 'عَبَسَ وَتَوَلَّىٰ', translation: 'He frowned and turned away.' }
      ]},
      { id: 81, name: 'At-Takwir', nameArabic: 'التكوير', verses: 29, lines: [
        { arabic: 'إِذَا الشَّمْسُ كُوِّرَتْ', translation: 'When the sun is wrapped up.' }
      ]},
      { id: 82, name: 'Al-Infitar', nameArabic: 'الانفطار', verses: 19, lines: [
        { arabic: 'إِذَا السَّمَاءُ انفَطَرَتْ', translation: 'When the sky breaks apart.' }
      ]},
      { id: 83, name: 'Al-Mutaffifin', nameArabic: 'المطففين', verses: 36, lines: [
        { arabic: 'وَيْلٌ لِّلْمُطَفِّفِينَ', translation: 'Woe to those who give less.' }
      ]},
      { id: 84, name: 'Al-Inshiqaq', nameArabic: 'الانشقاق', verses: 25, lines: [
        { arabic: 'إِذَا السَّمَاءُ انشَقَّتْ', translation: 'When the sky is split apart.' }
      ]},
      { id: 85, name: 'Al-Buruj', nameArabic: 'البروج', verses: 22, lines: [
        { arabic: 'وَالسَّمَاءِ ذَاتِ الْبُرُوجِ', translation: 'By the sky containing great stars.' }
      ]},
      { id: 86, name: 'At-Tariq', nameArabic: 'الطارق', verses: 17, lines: [
        { arabic: 'وَالسَّمَاءِ وَالطَّارِقِ', translation: 'By the sky and the night comer.' }
      ]},
      { id: 87, name: 'Al-Ala', nameArabic: 'الأعلى', verses: 19, lines: [
        { arabic: 'سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَىٰ', translation: 'Exalt the name of your Lord, the Most High.' }
      ]},
      { id: 88, name: 'Al-Ghashiyah', nameArabic: 'الغاشية', verses: 26, lines: [
        { arabic: 'هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ', translation: 'Has there reached you the report of the overwhelming event?' }
      ]},
      { id: 89, name: 'Al-Fajr', nameArabic: 'الفجر', verses: 30, lines: [
        { arabic: 'وَالْفَجْرِ', translation: 'By the dawn.' }
      ]},
      { id: 90, name: 'Al-Balad', nameArabic: 'البلد', verses: 20, lines: [
        { arabic: 'لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ', translation: 'I swear by this city.' }
      ]},
      { id: 91, name: 'Ash-Shams', nameArabic: 'الشمس', verses: 15, lines: [
        { arabic: 'وَالشَّمْسِ وَضُحَاهَا', translation: 'By the sun and its brightness.' }
      ]},
      { id: 92, name: 'Al-Layl', nameArabic: 'الليل', verses: 21, lines: [
        { arabic: 'وَاللَّيْلِ إِذَا يَغْشَىٰ', translation: 'By the night when it covers.' }
      ]},
      { id: 93, name: 'Ad-Duha', nameArabic: 'الضحى', verses: 11, lines: [
        { arabic: 'وَالضُّحَىٰ', translation: 'By the morning brightness.' }
      ]},
      { id: 94, name: 'Ash-Sharh', nameArabic: 'الشرح', verses: 8, lines: [
        { arabic: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ', translation: 'Did We not expand for you your breast?' }
      ]},
      { id: 95, name: 'At-Tin', nameArabic: 'التين', verses: 8, lines: [
        { arabic: 'وَالتِّينِ وَالزَّيْتُونِ', translation: 'By the fig and the olive.' }
      ]},
      { id: 96, name: 'Al-Alaq', nameArabic: 'العلق', verses: 19, lines: [
        { arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', translation: 'Recite in the name of your Lord who created.' }
      ]},
      { id: 97, name: 'Al-Qadr', nameArabic: 'القدر', verses: 5, lines: [
        { arabic: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ', translation: 'Indeed, We sent it down during the Night of Decree.' }
      ]},
      { id: 98, name: 'Al-Bayyinah', nameArabic: 'البينة', verses: 8, lines: [
        { arabic: 'لَمْ يَكُنِ الَّذِينَ كَفَرُوا', translation: 'Those who disbelieved.' }
      ]},
      { id: 99, name: 'Az-Zalzalah', nameArabic: 'الزلزلة', verses: 8, lines: [
        { arabic: 'إِذَا زُلْزِلَتِ الْأَرْضُ', translation: 'When the earth is shaken with its final earthquake.' }
      ]},
      { id: 100, name: 'Al-Adiyat', nameArabic: 'العاديات', verses: 11, lines: [
        { arabic: 'وَالْعَادِيَاتِ ضَبْحًا', translation: 'By the racers, panting.' }
      ]},
      { id: 101, name: 'Al-Qariah', nameArabic: 'القارعة', verses: 11, lines: [
        { arabic: 'الْقَارِعَةُ', translation: 'The Striking Calamity.' }
      ]},
      { id: 102, name: 'At-Takathur', nameArabic: 'التكاثر', verses: 8, lines: [
        { arabic: 'أَلْهَاكُمُ التَّكَاثُرُ', translation: 'Competition in increase diverts you.' }
      ]},
      { id: 103, name: 'Al-Asr', nameArabic: 'العصر', verses: 3, lines: [
        { arabic: 'وَالْعَصْرِ', translation: 'By time.' }
      ]},
      { id: 104, name: 'Al-Humazah', nameArabic: 'الهمزة', verses: 9, lines: [
        { arabic: 'وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ', translation: 'Woe to every slanderer and backbiter.' }
      ]},
      { id: 105, name: 'Al-Fil', nameArabic: 'الفيل', verses: 5, lines: [
        { arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ', translation: 'Have you not considered how your Lord dealt with the companions of the elephant?' }
      ]},
      { id: 106, name: 'Quraysh', nameArabic: 'قريش', verses: 4, lines: [
        { arabic: 'لِإِيلَافِ قُرَيْشٍ', translation: 'For the accustomed security of Quraysh.' }
      ]},
      { id: 107, name: 'Al-Maun', nameArabic: 'الماعون', verses: 7, lines: [
        { arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ', translation: 'Have you seen the one who denies the Recompense?' }
      ]},
      { id: 108, name: 'Al-Kawthar', nameArabic: 'الكوثر', verses: 3, lines: [
        { arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', translation: 'Indeed, We have granted you al-Kawthar.' }
      ]},
      { id: 109, name: 'Al-Kafirun', nameArabic: 'الكافرون', verses: 6, lines: [
        { arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', translation: 'Say, O disbelievers.' }
      ]},
      { id: 110, name: 'An-Nasr', nameArabic: 'النصر', verses: 3, lines: [
        { arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ', translation: 'When the victory of Allah has come.' }
      ]},
      { id: 111, name: 'Al-Masad', nameArabic: 'المسد', verses: 5, lines: [
        { arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ', translation: 'May the hands of Abu Lahab be ruined.' }
      ]},
      { id: 112, name: 'Al-Ikhlas', nameArabic: 'الإخلاص', verses: 4, lines: [
        { arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Say, He is Allah, the One.' },
        { arabic: 'اللَّهُ الصَّمَدُ', translation: 'Allah, the Eternal Refuge.' },
        { arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translation: 'He neither begets nor is born.' },
        { arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', translation: 'Nor is there to Him any equivalent.' }
      ]},
      { id: 113, name: 'Al-Falaq', nameArabic: 'الفلق', verses: 5, lines: [
        { arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', translation: 'Say, I seek refuge in the Lord of daybreak.' },
        { arabic: 'مِن شَرِّ مَا خَلَقَ', translation: 'From the evil of that which He created.' },
        { arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', translation: 'And from the evil of darkness when it settles.' },
        { arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', translation: 'And from the evil of the blowers in knots.' },
        { arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', translation: 'And from the evil of an envier when he envies.' }
      ]},
      { id: 114, name: 'An-Nas', nameArabic: 'الناس', verses: 6, lines: [
        { arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', translation: 'Say, I seek refuge in the Lord of mankind.' },
        { arabic: 'مَلِكِ النَّاسِ', translation: 'The Sovereign of mankind.' },
        { arabic: 'إِلَٰهِ النَّاسِ', translation: 'The God of mankind.' },
        { arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', translation: 'From the evil of the retreating whisperer.' },
        { arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', translation: 'Who whispers into the breasts of mankind.' },
        { arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', translation: 'From among the jinn and mankind.' }
      ]}
    ];
    setSurahs(completeQuran);
  }, []);

  const progress = userProgress.totalVerses > 0 ? 
    Math.round((userProgress.memorizedVerses / userProgress.totalVerses) * 100) : 0;
  const selectSurah = (surah) => {
    setSelectedSurah(surah);
    setCurrentSurahData(surah);
    setCurrentLineIndex(0);
    setShowSurahSelection(false);
    startLearningSurah(surah);
    setActiveTab('memorize');
  };

  const startLearningSurah = (surah) => {
    setLearningSession({
      startTime: Date.now(),
      currentSurah: surah,
      currentLine: 0,
      practiceCount: 0,
      sessionTime: 0
    });
    setShowTranslation(true);
    setUserInput('');
    setIsCorrect(null);
  };

  const startLearningSession = () => {
    setShowSurahSelection(true);
    setSurahSearchTerm('');
  };
  const practiceCurrentLine = () => {
    if (!currentSurahData || currentLineIndex >= currentSurahData.lines.length) return;
    
    setLearningSession(prev => ({
      ...prev,
      practiceCount: prev.practiceCount + 1
    }));
  };

  const nextLine = () => {
    if (currentSurahData && currentLineIndex < currentSurahData.lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
      setUserInput('');
      setIsCorrect(null);
    } else if (currentSurahData && currentLineIndex >= currentSurahData.lines.length - 1) {
      // Surah completed - all lines finished
      markSurahCompleted();
    }
  };

  const markSurahCompleted = () => {
    if (!currentSurahData) return;
    
    const today = new Date().toDateString();
    const lastStudyDate = userProgress.lastStudyDate;
    const isNewDay = lastStudyDate !== today;
    
    setUserProgress(prev => ({
      ...prev,
      memorizedVerses: prev.memorizedVerses + currentSurahData.lines.length,
      totalVerses: prev.totalVerses + currentSurahData.lines.length,
      streak: isNewDay ? prev.streak + 1 : prev.streak,
      lastStudyDate: today,
      totalTime: prev.totalTime + Math.floor((Date.now() - learningSession.startTime) / 60000),
      surahProgress: {
        ...prev.surahProgress,
        [currentSurahData.id]: {
          completed: true,
          completedDate: today,
          linesMemorized: currentSurahData.lines.length
        }
      }
    }));
    
    setSurahCompleted(true);
    showAchievement('surah_completed');
    
    setTimeout(() => {
      endLearningSession();
      setSurahCompleted(false);
      setActiveTab('home');
    }, 3000);
  };

  const checkUserInput = () => {
    if (!userInput.trim() || !currentSurahData) return;
    
    const currentLine = currentSurahData.lines[currentLineIndex];
    const similarity = calculateSimilarity(userInput.toLowerCase(), currentLine.arabic.toLowerCase());
    const isCorrectAnswer = similarity > 0.7;
    
    setIsCorrect(isCorrectAnswer);
    
    if (isCorrectAnswer) {
      practiceCurrentLine();
      setTimeout(() => {
        nextLine();
      }, 1500);
    }
    
    setUserInput('');
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const getCurrentLine = () => {
    if (!currentSurahData || currentLineIndex >= currentSurahData.lines.length) return null;
    return currentSurahData.lines[currentLineIndex];
  };

  const getSurahProgress = (surahId) => {
    return userProgress.surahProgress[surahId] || { completed: false, linesMemorized: 0 };
  };
  const getFilteredSurahs = () => {
    if (!surahSearchTerm.trim()) return surahs;
    return surahs.filter(surah => 
      surah.name.toLowerCase().includes(surahSearchTerm.toLowerCase()) ||
      surah.nameArabic.includes(surahSearchTerm)
    );
  };

  const showAchievement = (type) => {
    const messages = {
      'surah_completed': 'Well done! You finished memorizing this surah.',
      'first_surah': 'Great job on your first surah!',
      'streak_7': 'Nice work! 7 days in a row.',
      'streak_30': 'Outstanding! 30 days straight.'
    };
    
    console.log(messages[type] || 'Good progress!');
  };

  const endLearningSession = () => {
    if (learningSession.startTime) {
      const sessionTime = Math.floor((Date.now() - learningSession.startTime) / 60000);
      setUserProgress(prev => ({
        ...prev,
        totalTime: prev.totalTime + sessionTime
      }));
    }
    
    setLearningSession({
      startTime: null,
      currentSurah: null,
      currentLine: 0,
      practiceCount: 0,
      sessionTime: 0
    });
    setCurrentSurahData(null);
    setCurrentLineIndex(0);
    setSelectedSurah(null);
  };

  const tabs = [
    { id: 'home', icon: '●', label: 'Home' },
    { id: 'memorize', icon: '●', label: 'Memorize' },
    { id: 'progress', icon: '●', label: 'Progress' },
    { id: 'review', icon: '●', label: 'Review' },
    { id: 'profile', icon: '●', label: 'Profile' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="modern-content">
            {/* Progress Section */}
            <div className="progress-section mb-5">
              <div className="text-center">
                <h2 className="modern-title mb-4">Your Progress</h2>
                <div className="progress-circle-container">
                  <div className="progress-circle">
                    <svg className="progress-ring" width="200" height="200">
                      <circle
                        className="progress-ring-circle-bg"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                        r="90"
                        cx="100"
                        cy="100"
                      />
                      <circle
                        className="progress-ring-circle"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="transparent"
                        r="90"
                        cx="100"
                        cy="100"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 90}`,
                          strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`
                        }}
                      />
                    </svg>
                    <div className="progress-text">
                      <div className="progress-percentage">{progress}%</div>
                      <div className="progress-label">Complete</div>
                    </div>
                  </div>
                </div>
                <p className="modern-subtitle mt-3">Keep up the good work</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3 className="modern-section-title mb-4">Quick Actions</h3>
              <div className="row g-3">
                <div className="col-6">
                  <div className="action-card" onClick={startLearningSession}>
                    <div className="action-icon">📖</div>
                    <div className="action-text">Start Learning</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('review')}>
                    <div className="action-icon">🔄</div>
                    <div className="action-text">Review</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('progress')}>
                    <div className="action-icon">📊</div>
                    <div className="action-text">Progress</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('profile')}>
                    <div className="action-icon">👤</div>
                    <div className="action-text">Profile</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Surah Selection */}
            {showSurahSelection && (
              <div className="surah-selection mt-4">
                <div className="surah-selection-header">
                  <h3 className="modern-section-title mb-4">Choose a Surah to Memorize</h3>
                  <button 
                    className="btn-modern-outline"
                    onClick={() => setShowSurahSelection(false)}
                  >
                    Close
                  </button>
                </div>
                
                <div className="surah-search">
                  <input
                    type="text"
                    className="surah-search-input"
                    placeholder="Search surahs by name (e.g., Fatiha, Baqarah)..."
                    value={surahSearchTerm}
                    onChange={(e) => setSurahSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="surahs-grid">
                  {getFilteredSurahs().map(surah => {
                    const progress = getSurahProgress(surah.id);
                    return (
                      <div 
                        key={surah.id} 
                        className="surah-card"
                        onClick={() => selectSurah(surah)}
                      >
                        <div className="surah-header">
                          <h4 className="surah-name">{surah.name}</h4>
                          <span className="surah-arabic">{surah.nameArabic}</span>
                        </div>
                        <div className="surah-info">
                          <span className="surah-verses">{surah.verses} verses</span>
                          {progress.completed && (
                            <span className="surah-completed">Completed</span>
                          )}
                        </div>
                        {progress.completed && (
                          <div className="surah-progress-bar">
                            <div className="surah-progress-fill" style={{width: '100%'}}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {getFilteredSurahs().length === 0 && (
                  <div className="no-surahs-found">
                    <p>No surahs found matching "{surahSearchTerm}"</p>
                    <button 
                      className="btn-modern-outline"
                      onClick={() => setSurahSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        );

      case 'memorize':
        const currentLine = getCurrentLine();
        const sessionTime = learningSession.startTime ? 
          Math.floor((Date.now() - learningSession.startTime) / 1000) : 0;
        
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Memorization</h2>
            
            {surahCompleted ? (
              <div className="completion-content">
                <div className="completion-card">
                  <div className="completion-icon">✓</div>
                  <h3 className="completion-title">Done!</h3>
                  <p className="completion-message">
                    You finished memorizing {currentSurahData?.name}.
                  </p>
                  <p className="completion-note">
                    Going back to home...
                  </p>
                </div>
              </div>
            ) : currentSurahData && currentLine ? (
              <div className="memorization-content">
                <div className="verse-card">
                  <div className="verse-info">
                    <h4 className="verse-surah">{currentSurahData.name} - Line {currentLineIndex + 1} of {currentSurahData.lines.length}</h4>
                    <div className="progress-indicator">
                      <span>Progress: {currentLineIndex + 1}/{currentSurahData.lines.length}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${((currentLineIndex + 1) / currentSurahData.lines.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="session-info">
                      <span>Practice Count: {learningSession.practiceCount}</span>
                      <span>Session Time: {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  
                  <div className="verse-text">
                    {currentLine.arabic}
                  </div>
                  
                  <div className="translation-section">
                    <button 
                      className="btn-modern-outline"
                      onClick={() => setShowTranslation(!showTranslation)}
                    >
                      {showTranslation ? 'Hide Translation' : 'Show Translation'}
                    </button>
                    {showTranslation && (
                      <div className="verse-translation">
                        {currentLine.translation}
                      </div>
                    )}
                  </div>
                  
                  <div className="learning-input">
                    <h5>Try to recite from memory:</h5>
                    <textarea
                      className="verse-input"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type the line in Arabic..."
                      rows="3"
                    />
                    <div className="input-actions">
                      <button 
                        className="btn-modern"
                        onClick={checkUserInput}
                        disabled={!userInput.trim()}
                      >
                        Check Answer
                      </button>
                      <button 
                        className="btn-modern-outline"
                        onClick={() => setUserInput('')}
                      >
                        Clear
                      </button>
                    </div>
                    
                    {isCorrect !== null && (
                      <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? 'Good job! Moving to next line...' : 'Try again, you\'re close.'}
                      </div>
                    )}
                  </div>
                  
                  <div className="verse-actions">
                    <button 
                      className="btn-modern"
                      onClick={nextLine}
                    >
                      Finished Line
                    </button>
                    <button 
                      className="btn-modern-outline"
                      onClick={startLearningSession}
                    >
                      Choose Different Surah
                    </button>
                    <button 
                      className="btn-modern-outline"
                      onClick={endLearningSession}
                    >
                      End Session
                    </button>
                  </div>
                  
                  <p className="learning-note">
                    Type the line correctly to move forward automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="no-verse-content">
                <h3>Pick a surah</h3>
                <p>Select a surah to begin learning</p>
                <button 
                  className="btn-modern"
                  onClick={startLearningSession}
                >
                  Choose Surah
                </button>
              </div>
            )}
          </div>
        );

      case 'progress':
        const dailyProgress = userProgress.memorizedVerses || 0;
        const weeklyProgress = Math.min(userProgress.weeklyGoal || 15, userProgress.memorizedVerses || 0);
        const dailyGoalProgress = Math.min(userProgress.dailyGoal || 3, dailyProgress);
        
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Your Progress</h2>
            
            {/* Main Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{userProgress.memorizedVerses || 0}</div>
                <div className="stat-label">Verses Memorized</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{userProgress.streak || 0}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{userProgress.totalTime || 0}</div>
                <div className="stat-label">Minutes Studied</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{surahs.length * 5}</div>
                <div className="stat-label">Total Verses</div>
              </div>
            </div>
            
            {/* Goals Progress */}
            <div className="goals-section mt-4">
              <h3 className="modern-section-title mb-3">Goals Progress</h3>
              <div className="goals-grid">
                <div className="goal-card">
                  <div className="goal-header">
                    <span className="goal-title">Daily Goal</span>
                    <span className="goal-progress">{dailyGoalProgress}/{userProgress.dailyGoal || 3}</span>
                  </div>
                  <div className="goal-bar">
                    <div 
                      className="goal-fill" 
                      style={{width: `${Math.min(100, (dailyGoalProgress / (userProgress.dailyGoal || 3)) * 100)}%`}}
                    ></div>
                  </div>
                </div>
                <div className="goal-card">
                  <div className="goal-header">
                    <span className="goal-title">Weekly Goal</span>
                    <span className="goal-progress">{weeklyProgress}/{userProgress.weeklyGoal || 15}</span>
                  </div>
                  <div className="goal-bar">
                    <div 
                      className="goal-fill" 
                      style={{width: `${Math.min(100, (weeklyProgress / (userProgress.weeklyGoal || 15)) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Learning Analytics */}
            <div className="analytics-section mt-4">
              <h3 className="modern-section-title mb-3">Learning Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-title">Average Study Time</div>
                  <div className="analytics-value">
                    {(userProgress.memorizedVerses || 0) > 0 ? 
                      Math.round((userProgress.totalTime || 0) / (userProgress.memorizedVerses || 1)) : 0} min/verse
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-title">Completion Rate</div>
                  <div className="analytics-value">
                    {surahs.length > 0 ? 
                      Math.round(((userProgress.memorizedVerses || 0) / (surahs.length * 5)) * 100) : 0}%
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-title">Learning Streak</div>
                  <div className="analytics-value">{userProgress.streak} days</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-title">Last Study</div>
                  <div className="analytics-value">
                    {userProgress.lastStudyDate ? 
                      new Date(userProgress.lastStudyDate).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Surah Progress */}
            <div className="progress-details mt-4">
              <h3 className="modern-section-title mb-3">Surah Progress</h3>
              <div className="surahs-progress-list">
                {surahs.map(surah => {
                  const progress = getSurahProgress(surah.id);
                  return (
                    <div key={surah.id} className="surah-progress-item">
                      <div className="surah-info">
                        <div className="surah-title">
                          {surah.name} ({surah.nameArabic})
                        </div>
                        <div className="surah-details">
                          <span>{surah.verses} verses</span>
                          {progress.completed && progress.completedDate && (
                            <span className="completion-date">
                              Completed: {new Date(progress.completedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="surah-status">
                        {progress.completed ? (
                          <span className="status-memorized">Completed</span>
                        ) : (
                          <span className="status-not-started">Not Started</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="progress-actions mt-4">
              <button 
                className="btn-modern"
                onClick={() => setActiveTab('memorize')}
              >
                Continue Learning
              </button>
              <button 
                className="btn-modern-outline"
                onClick={() => setActiveTab('review')}
              >
                Review Verses
              </button>
            </div>
          </div>
        );

      case 'review':
        const completedSurahs = surahs.filter(surah => getSurahProgress(surah.id).completed);
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Review</h2>
            <div className="review-content">
              {completedSurahs.length > 0 ? (
                <div className="review-cards">
                  {completedSurahs.map(surah => {
                    const progress = getSurahProgress(surah.id);
                    return (
                      <div key={surah.id} className="review-card">
                        <div className="review-title">{surah.name} ({surah.nameArabic})</div>
                        <div className="review-info">
                          <span>{surah.verses} verses completed</span>
                          {progress.completedDate && (
                            <span>Completed: {new Date(progress.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <button 
                          className="btn-modern"
                          onClick={() => {
                            selectSurah(surah);
                            startLearningSurah(surah);
                          }}
                        >
                          Review This Surah
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-review-content">
                  <p className="no-review-text">No surahs completed yet. Start learning to build your review list!</p>
                  <button 
                    className="btn-modern"
                    onClick={startLearningSession}
                  >
                    Start Learning
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Profile</h2>
            <div className="profile-content">
              <div className="profile-card">
                <div className="profile-avatar">
                  <span className="avatar-text">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                </div>
                <div className="profile-info">
                  <h4 className="profile-name">{user.name || 'User'}</h4>
                  <p className="profile-email">{user.email || 'No email'}</p>
                </div>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-label">Surahs Completed</span>
                    <span className="stat-value">
                      {Object.values(userProgress.surahProgress || {}).filter(p => p.completed).length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Study Time</span>
                    <span className="stat-value">{userProgress.totalTime || 0} min</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Learning Streak</span>
                    <span className="stat-value">{userProgress.streak || 0} days</span>
                  </div>
                </div>
                <button 
                  onClick={onSignOut} 
                  className="btn-modern-outline"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modern-dashboard">
      {/* Header */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon">Q</span>
            <span className="header-text">Quran Memorization</span>
          </div>
          <div className="header-user">
            <span className="user-name">{user.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="modern-main">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="modern-bottom-nav">
        <div className="nav-slider" style={{
          transform: `translateX(${(tabs.findIndex(tab => tab.id === activeTab) * 100)}%)`
        }}></div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
