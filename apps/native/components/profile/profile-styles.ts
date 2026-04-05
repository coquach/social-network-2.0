import { StyleSheet } from 'react-native';

const INTER_REGULAR = 'Inter-Regular';
const INTER_BOLD = 'Inter-Bold';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarTitle: {
    fontFamily: INTER_BOLD,
    fontSize: 18,
    lineHeight: 22,
  },
  iconButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  coverWrap: {
    height: 158,
    width: '100%',
    overflow: 'hidden',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrap: {
    paddingHorizontal: 14,
  },
  avatarRing: {
    marginTop: -54,
    height: 114,
    width: 114,
    borderRadius: 57,
    padding: 4,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    borderRadius: 53,
  },
  profileName: {
    marginTop: 14,
    fontFamily: INTER_BOLD,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  profileBio: {
    marginTop: 4,
    fontFamily: INTER_REGULAR,
    fontSize: 14,
    lineHeight: 22,
  },
  editButton: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  editButtonText: {
    fontFamily: INTER_BOLD,
    fontSize: 16,
    lineHeight: 20,
  },
  sectionCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: INTER_BOLD,
    fontSize: 16,
    lineHeight: 22,
  },
  sectionLink: {
    fontFamily: INTER_BOLD,
    fontSize: 14,
    lineHeight: 18,
  },
  friendsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  friendItem: {
    width: '31.8%',
  },
  friendImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  friendLabel: {
    marginTop: 6,
    fontFamily: INTER_REGULAR,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 4,
  },
  photoImage: {
    width: '32.2%',
    aspectRatio: 1,
    borderRadius: 4,
  },
  postsWrap: {
    marginTop: 14,
  },
  postsHeading: {
    marginBottom: 10,
    fontFamily: INTER_BOLD,
    fontSize: 16,
    lineHeight: 22,
  },
  postCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postMetaBlock: {
    flex: 1,
  },
  postAuthor: {
    fontFamily: INTER_BOLD,
    fontSize: 16,
    lineHeight: 20,
  },
  postMetaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postMetaText: {
    fontFamily: INTER_REGULAR,
    fontSize: 10,
    lineHeight: 14,
  },
  postContent: {
    marginBottom: 10,
    fontFamily: INTER_REGULAR,
    fontSize: 14,
    lineHeight: 22,
  },
  postQuote: {
    fontStyle: 'italic',
  },
  postMedia: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    marginBottom: 10,
  },
  postActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  actionText: {
    fontFamily: INTER_REGULAR,
    fontSize: 12,
    lineHeight: 16,
  },
  modalActions: {
    gap: 10,
  },
  modalPrimaryButton: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    fontFamily: INTER_BOLD,
    fontSize: 16,
    lineHeight: 20,
  },
  modalSecondaryText: {
    fontFamily: INTER_BOLD,
    fontSize: 16,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  pressedAction: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  disabledButton: {
    opacity: 0.6,
  },
});
