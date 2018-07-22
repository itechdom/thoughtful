/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

export function detectLanguage(text) {
  // [START translate_detect_language]
  // Imports the Google Cloud client library
  const Translate = require("@google-cloud/translate");

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const text = 'The text for which to detect language, e.g. Hello, world!';

  // Detects the language. "text" can be a string for detecting the language of
  // a single piece of text, or an array of strings for detecting the languages
  // of multiple texts.
  return translate
    .detect(text)
    .then(results => {
      let detections = results[0];
      detections = Array.isArray(detections) ? detections : [detections];

      console.log("Detections:");
      detections.forEach(detection => {
        console.log(`${detection.input} => ${detection.language}`);
      });
      return detections;
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
  // [END translate_detect_language]
}

export function listLanguages() {
  // [START translate_list_codes]
  // Imports the Google Cloud client library
  const Translate = require("@google-cloud/translate");

  // Creates a client
  const translate = new Translate();

  // Lists available translation language with their names in English (the default).
  return translate
    .getLanguages()
    .then(results => {
      const languages = results[0];

      console.log("Languages:");
      languages.forEach(language => console.log(language));
      return languages;
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
  // [END translate_list_codes]
}

export function listLanguagesWithTarget(target) {
  // [START translate_list_language_names]
  // Imports the Google Cloud client library
  const Translate = require("@google-cloud/translate");

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const target = 'The target language for language names, e.g. ru';

  // Lists available translation language with their names in a target language
  translate
    .getLanguages(target)
    .then(results => {
      const languages = results[0];

      console.log("Languages:");
      languages.forEach(language => console.log(language));
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
  // [END translate_list_language_names]
}

export function translateText(text, target) {
  // [START translate_translate_text]
  // Imports the Google Cloud client library
  const Translate = require("@google-cloud/translate");

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'The text to translate, e.g. Hello, world!';
  // const target = 'The target language, e.g. ru';

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  return translate
    .translate(text, target)
    .then(results => {
      let translations = results[0];
      translations = Array.isArray(translations)
        ? translations
        : [translations];
      return translations;
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
  // [END translate_translate_text]
}

export function translateTextWithModel(text, target, model) {
  // [START translate_text_with_model]
  // Imports the Google Cloud client library
  const Translate = require("@google-cloud/translate");

  // Creates a client
  const translate = new Translate();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'The text to translate, e.g. Hello, world!';
  // const target = 'The target language, e.g. ru';
  // const model = 'The model to use, e.g. nmt';

  const options = {
    // The target language, e.g. "ru"
    to: target,
    // Make sure your project is whitelisted.
    // Possible values are "base" and "nmt"
    model: model
  };

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  translate
    .translate(text, options)
    .then(results => {
      let translations = results[0];
      translations = Array.isArray(translations)
        ? translations
        : [translations];

      console.log("Translations:");
      translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
      });
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
  // [END translate_text_with_model]
}
