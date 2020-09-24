import {
  CategoryColorLine,
  CategoryAttribution,
  TwoOrThreeBox,
  LanguageToggleButton,
} from './Misc';
import React  from 'react';
import classNames  from 'classnames';
import PropTypes  from 'prop-types';
import Sefaria  from './sefaria/sefaria';
import Footer  from './Footer';
import MobileHeader from './MobileHeader';
import Component from 'react-class';


class ReaderNavigationCategoryMenu extends Component {
  // Navigation Menu for a single category of texts (e.g., "Tanakh", "Bavli")
  render() {

    // Show Talmud with Toggles
    var categories  = this.props.categories[0] === "Talmud" && this.props.categories.length == 1 ?
                        ["Talmud", "Bavli"] : this.props.categories;

    if (categories[0] === "Talmud" && categories.length <= 2) {
      var setBavli = function() {
        this.props.setCategories(["Talmud", "Bavli"]);
      }.bind(this);
      var setYerushalmi = function() {
        this.props.setCategories(["Talmud", "Yerushalmi"]);
      }.bind(this);
      var bClasses = classNames({navToggle:1, active: categories[1] === "Bavli"});
      var yClasses = classNames({navToggle:1, active: categories[1] === "Yerushalmi", second: 1});

      var toggle =(<div className="navToggles">
                            <span className={bClasses} onClick={setBavli}>
                              <span className="en">Bavli</span>
                              <span className="he">בבלי</span>
                            </span>
                            <span className="navTogglesDivider">|</span>
                            <span className={yClasses} onClick={setYerushalmi}>
                              <span className="en">Yerushalmi</span>
                              <span className="he">ירושלמי</span>
                            </span>
                         </div>);
      var catTitle   = (categories.length > 1) ? categories[0] +  " " + categories[1] : categories[0];
      var heCatTitle = (categories.length > 1) ? Sefaria.hebrewTerm(categories[0]) + " " + Sefaria.hebrewTerm(categories[1]): Sefaria.hebrewTerm(categories[0]);
    } else {
      var toggle = null;
      if (this.props.category === "Commentary") {
        var catTitle   = this.props.categories[0] + " Commentary";
        var heCatTitle = Sefaria.hebrewTerm(this.props.categories[0]) + " " + Sefaria.hebrewTerm("Commentary"); // HEBREW NEEDED
      } else {
        var catTitle   = this.props.category;
        var heCatTitle = Sefaria.hebrewTerm(this.props.category);
      }

    }
    var catContents    = Sefaria.tocItemsByCategories(categories);
    var nestLevel      = this.props.category == "Commentary" ? 1 : 0;
    var footer         = this.props.compare ? null : <Footer />;
    var navMenuClasses = classNames({readerNavCategoryMenu: 1, readerNavMenu: 1, noHeader: this.props.hideNavHeader, noLangToggleInHebrew: 1});
    var contentClasses = classNames({content: 1, hasFooter: footer != null});
    return (<div className={navMenuClasses}>
              <MobileHeader
                mode={'innerTOC'}
                hideNavHeader={this.props.hideNavHeader}
                interfaceLang={this.props.interfaceLang}
                category={categories[0]}
                openDisplaySettings={this.props.openDisplaySettings}
                navHome={this.props.navHome}
                compare={this.props.compare}
                catTitle={catTitle}
                heCatTitle={heCatTitle}
              />
              <div className={contentClasses}>
                <div className="contentInner">
                  {this.props.hideNavHeader ? (<h1>
                      {this.props.interfaceLang !== "hebrew"  && Sefaria._siteSettings.TORAH_SPECIFIC ? <LanguageToggleButton toggleLanguage={this.props.toggleLanguage} /> : null }
                      <span className="en">{catTitle}</span>
                      <span className="he">{heCatTitle}</span>
                    </h1>) : null}
                  {toggle}
                  <CategoryAttribution categories={categories} />
                  <ReaderNavigationCategoryMenuContents
                    contents={catContents}
                    categories={categories}
                    width={this.props.width}
                    category={this.props.category}
                    contentLang={this.props.contentLang}
                    nestLevel={nestLevel} />
                </div>
                {footer}
              </div>
            </div>);
  }
}
ReaderNavigationCategoryMenu.propTypes = {
  category:            PropTypes.string.isRequired,
  categories:          PropTypes.array.isRequired,
  setCategories:       PropTypes.func.isRequired,
  toggleLanguage:      PropTypes.func.isRequired,
  openDisplaySettings: PropTypes.func.isRequired,
  navHome:             PropTypes.func.isRequired,
  width:               PropTypes.number,
  compare:             PropTypes.bool,
  hideNavHeader:       PropTypes.bool,
  contentLang:         PropTypes.string,
  interfaceLang:       PropTypes.string,
};


class ReaderNavigationCategoryMenuContents extends Component {
  // Inner content of Category menu (just category title and boxes of texts/subcategories)
  getRenderedTextTitleString(title, heTitle){
    var whiteList = ['Midrash Mishlei', 'Midrash Tehillim', 'Midrash Tanchuma'];
    var displayCategory = this.props.category;
    var displayHeCategory = Sefaria.hebrewTerm(this.props.category);
    if (whiteList.indexOf(title) == -1){
      var replaceTitles = {
        "en": ['Jerusalem Talmud', displayCategory],
        "he": ['תלמוד ירושלמי', displayHeCategory]
      };
      var replaceOther = {
        "en" : [", ", " on ", " to ", " of "],
        "he" : [", ", " על "]
      };
      //this will replace a category name at the beginning of the title string and any connector strings (0 or 1) that follow.
      var titleRe = new RegExp(`^(${replaceTitles['en'].join("|")})(${replaceOther['en'].join("|")})?`);
      var heTitleRe = new RegExp(`^(${replaceTitles['he'].join("|")})(${replaceOther['he'].join("|")})?`);
      title   = title == displayCategory ? title : title.replace(titleRe, "");
      heTitle = heTitle == displayHeCategory ? heTitle : heTitle.replace(heTitleRe, "");
    }
    return [title, heTitle];
  }
  hebrewContentSort(cats) {
    // Sorts contents of this category by Hebrew Alphabetical
    //console.log(cats);
    const heCats = cats.slice().map(function(item, indx) {
      item.enOrder = indx;
      return item;
    });
    //console.log(heCats.slice())
    heCats.sort(function(a, b) {
      if ("order" in a || "order" in b) {
        const aOrder = "order" in a ? a.order : 9999;
        const bOrder = "order" in b ? b.order : 9999;
        return aOrder > bOrder ? 1 : -1;

      } else if (("category" in a) !== ("category" in b)) {
        return a.enOrder > b.enOrder ? 1 : -1;

      } else if (a.heComplete !== b.heComplete) {
        return a.heComplete ? -1 : 1;

      } else if (a.heTitle && b.heTitle) {
        return a.heTitle > b.heTitle ? 1 : -1;

      }
      return a.enOrder > b.enOrder ? 1 : -1;
    });
    //console.log(heCats)
    return heCats;
  }
  render() {
      var content = [];
      var cats = this.props.categories || [];
      var contents = this.props.contentLang == "hebrew" || Sefaria.interfaceLang == "hebrew" ?
                      this.hebrewContentSort(this.props.contents)
                      : this.props.contents;
      for (let i = 0; i < contents.length; i++) {
        var item = contents[i];
        if (item.category) {
          // Category
          var newCats = cats.concat(item.category);
          // Special Case categories which should nest but normally wouldn't given their depth
          var subcats = ["Mishneh Torah", "Shulchan Arukh", "Maharal"];
          if (Sefaria.util.inArray(item.category, subcats) > -1 || this.props.nestLevel > 0) {
            if(item.contents && item.contents.length == 1 && !("category" in item.contents[0])){
                var chItem = item.contents[0];
                var [title, heTitle] = this.getRenderedTextTitleString(chItem.title, chItem.heTitle);
                var url     = "/" + Sefaria.normRef(chItem.firstSection);
                var incomplete = this.props.contentLang == "hebrew" || Sefaria.interfaceLang == "hebrew" ? !chItem.heComplete : !chItem.enComplete;
                var classes = classNames({refLink: 1, blockLink: 1, incomplete: incomplete});
                content.push((<a href={url} className={classes} data-ref={chItem.firstSection} key={"text." + this.props.nestLevel + "." + i}>
                                <span className='en'>{title}</span>
                                <span className='he'>{heTitle}</span>
                              </a>
                              ));

            } else {
              // Create a link to a subcategory
              var url = "/texts/" + newCats.join("/");
              var incomplete = this.props.contentLang == "hebrew" || Sefaria.interfaceLang == "hebrew" ? !item.heComplete : !item.enComplete;
              var classes = classNames({catLink: 1, blockLink: 1, incomplete: incomplete});
              content.push((<a href={url} className={classes} data-cats={newCats.join("|")} key={"cat." + this.props.nestLevel + "." + i}>
                              <span className='en'>{item.category}</span>
                              <span className='he'>{item.heCategory}</span>
                            </a>
                          ));
            }
          } else {
            // TODO: In case this breaks, revert it
            if (item.category !== 'Targum') {
              // Add a Category
              content.push((<div className='category' key={"cat." + this.props.nestLevel + "." + i}>
                <h3>
                  <span className='en'>{item.category}</span>
                  <span className='he'>{item.heCategory}</span>
                </h3>
                <ReaderNavigationCategoryMenuContents
                  contents={item.contents}
                  categories={newCats}
                  width={this.props.width}
                  nestLevel={this.props.nestLevel + 1}
                  category={this.props.category}
                  contentLang={this.props.contentLang} />
              </div>));
            }
          }
        } else {
          if (item.isGroup) {
            // Add a Group
            var url = "/groups/" + item.name.replace(/\s/g, "-");
            var classes = classNames({groupLink: 1, blockLink: 1});
            content.push((<a href={url}
                            className={classes}
                            data-group={item.name}
                            key={"group." + this.props.nestLevel + "." + i}>
                            <span className='en'>{item.title}</span>
                            <span className='he'>{item.heTitle}</span>
                          </a>
                          ));
          } else {
            // Add a Text
            var [title, heTitle] = this.getRenderedTextTitleString(item.title, item.heTitle);
            const lastPlace = Sefaria.lastPlaceForText(item.title);
            var ref =  lastPlace ? lastPlace.ref : item.firstSection;
            var url = "/" + Sefaria.normRef(ref);
            var incomplete = this.props.contentLang == "hebrew" || Sefaria.interfaceLang == "hebrew" ? !item.heComplete : !item.enComplete;
            var classes = classNames({refLink: 1, blockLink: 1, incomplete: incomplete});
            content.push((<a href={url}
                            className={classes}
                            data-ref={ref}
                            key={"text." + this.props.nestLevel + "." + i}>
                            <span className='en'>{title}</span>
                            <span className='he'>{heTitle}</span>
                          </a>
                          ));

          }
        }
      }
      var boxedContent = [];
      var currentRun   = [];
      for (var i = 0; i < content.length; i++) {
        // Walk through content looking for runs of texts/subcats to group together into a table
        if (content[i].type == "div") { // this is a subcategory
          if (currentRun.length) {
            boxedContent.push((<TwoOrThreeBox content={currentRun} width={this.props.width} key={i} />));
            currentRun = [];
          }
          boxedContent.push(content[i]);
        } else  { // this is a single text
          currentRun.push(content[i]);
        }
      }
      if (currentRun.length) {
        boxedContent.push((<TwoOrThreeBox content={currentRun} width={this.props.width} key={i} />));
      }
      return (<div>{boxedContent}</div>);
  }
}
ReaderNavigationCategoryMenuContents.propTypes = {
  category:   PropTypes.string.isRequired,
  contents:   PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  width:      PropTypes.number,
  nestLevel:  PropTypes.number
};

ReaderNavigationCategoryMenuContents.defaultProps = {
  contents: []
};

export default ReaderNavigationCategoryMenu;
