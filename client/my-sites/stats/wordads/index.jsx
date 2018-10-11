/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import WordAdsChartTabs from '../wordads-chart-tabs';
import titlecase from 'to-title-case';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import JetpackColophon from 'components/jetpack-colophon';
import WordAdsEarnings from './earnings';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import PrivacyPolicyBanner from 'blocks/privacy-policy-banner';

// @TODO unused
import statsStrings from '../stats-strings';
import StickyPanel from 'components/sticky-panel';
import config from 'config';
import { getSiteOption } from 'state/sites/selectors';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import QueryKeyringConnections from 'components/data/query-keyring-connections';

class WordAds extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			chartTab: this.props.chartTab,
			tabSwitched: false,
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// @TODO update
		if ( ! this.state.tabSwitched && this.state.chartTab !== nextProps.chartTab ) {
			this.setState( {
				tabSwitched: true,
				chartTab: nextProps.chartTab,
			} );
		}
	}

	barClick = bar => {
		this.props.recordGoogleEvent( 'Stats', 'Clicked Chart Bar' );
		page.redirect( this.props.path + '?startDate=' + bar.data.period );
	};

	switchChart = tab => {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			this.setState( {
				chartTab: tab.attr,
				tabSwitched: true,
			} );
		}
	};

	render() {
		const { date, site, siteId, slug, translate } = this.props;

		const charts = [
			{
				attr: 'impressions',
				legendOptions: [ 'impressions' ],
				gridicon: 'visible',
				label: translate( 'Ads Served', { context: 'noun' } ),
			},
			{
				attr: 'cpm',
				gridicon: 'stats-alt',
				label: translate( 'Average CPM', { context: 'noun' } ),
			},
			{
				attr: 'revenue',
				gridicon: 'money',
				label: translate( 'Revenue', { context: 'noun' } ),
			},
		];

		const { period, endOf } = this.props.period;
		const moduleStrings = statsStrings(); // @TODO unused

		const currentDate = new Date();
		const today =
			( '0' + currentDate.getFullYear() ).slice( -4 ) +
			'-' +
			( '0' + ( currentDate.getMonth() + 1 ) ).slice( -2 ) +
			'-' +
			( '0' + currentDate.getDate() ).slice( -2 );

		const tomorrow =
			( '0' + currentDate.getFullYear() ).slice( -4 ) +
			'-' +
			( '0' + ( currentDate.getMonth() + 1 ) ).slice( -2 ) +
			'-' +
			( '0' + ( currentDate.getDate() - 1 ) ).slice( -2 );

		const queryDate =
			today === date.format( 'YYYY-MM-DD' ) && 'day' === period
				? tomorrow
				: date.format( 'YYYY-MM-DD' );

		const query = {
			// @TODO unused
			period: period,
			date: endOf.format( 'YYYY-MM-DD' ),
		};

		return (
			<Main wideLayout={ true }>
				{ /*
				<QueryKeyringConnections />
				{ siteId && <QuerySiteKeyrings siteId={ siteId } /> }
*/ }
				<DocumentHead title={ translate( 'WordAds Stats' ) } />
				<PageViewTracker
					path={ `/stats/wordads/${ period }/:site` }
					title={ `WordAds > ${ titlecase( period ) }` }
				/>
				<PrivacyPolicyBanner />
				<SidebarNavigation />
				<StatsNavigation
					selectedItem={ 'wordads' }
					interval={ period }
					siteId={ siteId }
					slug={ slug }
				/>
				<div id="my-stats-content">
					<WordAdsChartTabs
						barClick={ this.barClick }
						switchTab={ this.switchChart }
						charts={ charts }
						queryDate={ queryDate }
						period={ this.props.period }
						chartTab={ this.state.chartTab }
					/>
					<div className="stats__module-list">
						<WordAdsEarnings site={ site } />
					</div>
				</div>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			slug: getSelectedSiteSlug( state ),
		};
	},
	{ recordGoogleEvent }
)( localize( WordAds ) );
