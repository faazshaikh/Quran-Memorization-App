// Complete Quran data with all 114 surahs
// This file contains the complete Quran with Arabic text and English translations
// Data source: https://raw.githubusercontent.com/risan/quran-json/master/dist/quran_en.json

import quranData from './quran-complete.json';

// Transform the JSON data to match our app's structure
const transformQuranData = (data) => {
  return data.map(surah => ({
    id: surah.id,
    name: surah.transliteration,
    nameArabic: surah.name,
    verses: surah.total_verses,
    lines: surah.verses.map(verse => ({
      arabic: verse.text,
      translation: verse.translation
    }))
  }));
};

// Export the complete transformed Quran data
export const completeQuranData = transformQuranData(quranData);

// Function to get all surahs
export const getAllSurahs = () => {
  return completeQuranData;
};

// Function to get a specific surah by ID
export const getSurahById = (id) => {
  return completeQuranData.find(surah => surah.id === id);
};

// Function to get surahs by name (search)
export const searchSurahs = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return completeQuranData.filter(surah => 
    surah.name.toLowerCase().includes(term) || 
    surah.nameArabic.includes(term)
  );
};